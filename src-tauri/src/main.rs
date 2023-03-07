#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

// enables `app.get_window` and other stuff
use tauri::Manager;

// HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion
// need build number 22000
use winreg::RegKey;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            style_window(handle, "main");
        
            Ok(())
        })
        .on_window_event(|event| {
            match event.event() {
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    event.window().hide().unwrap();
                    api.prevent_close();
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            set_window_color,
            get_accent_color,
            set_decorations,
            open_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    println!("Tauri main function running");
}

fn style_window(handle: tauri::AppHandle, label: &str) -> Result<(), tauri::Error> {
    let window = handle.get_window(label);

    match window {
        Some(window) => {
            // apply window shadows, which also ensures that corners are correctly rounded
            #[cfg(any(windows, target_os = "macos"))]
            window_shadows::set_shadow(&window, true).unwrap();

            #[cfg(target_os = "windows")]
            {
                // read system info from the registry
                let hklm = RegKey::predef(winreg::enums::HKEY_LOCAL_MACHINE);

                // read the build number and version number
                let cur_ver = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion")?;
                let reg_build_number: String = cur_ver.get_value("CurrentBuildNumber")?;
                let build_number: u32 = reg_build_number.parse().unwrap();
                let reg_current_version: String = cur_ver.get_value("CurrentVersion")?;

                // only apply vibrancy if windows 11 or higher
                if build_number > 22000 && reg_current_version == "6.3" {
                    window_vibrancy::apply_mica(&window)
                    .expect("Unsupported platform! 'apply_mica' is only supported on Windows");
                
                    // we must minimize and maximize to force mica to apply
                    window.minimize().unwrap();
                    window.unminimize().unwrap();
                    window.maximize().unwrap();
                    window.unmaximize().unwrap();
                    window.set_focus()?;
                }

                Ok(())
            }
        }
        None => { Ok(()) }
    }
}


#[tauri::command]
async fn open_window(handle: tauri::AppHandle, label: String, title: String, location: String, width: Option<f64>, height: Option<f64>) {
    let maybe_window = handle.get_window(&label);

    let window_width = match width {
        Some(width) => { width }
        None => { 1000.0 }
    };
    let window_height = match height {
        Some(height) => { height }
        None => { 700.0 }
    };


    match maybe_window {
        Some(window) => {
            window.unminimize()
                .expect("failed to unminimize window");
            window.show()
                .expect("failed to show window");
            window.set_focus()
                .expect("failed to focus window");
        }
        None => {
            let window = tauri::WindowBuilder::new(
                &handle,
                &label, /* the unique window label */
                tauri::WindowUrl::App(location.into())
            )
                .decorations(true)
                .transparent(true)
                .resizable(true)
                .fullscreen(false)
                .focused(true)
                .title(&title)
                .inner_size(window_width, window_height)
                .build()
                .unwrap();

            window.eval(&format!("window.name = '{}';", label))
                .expect("failed to set javascript window name from tauri window label");
        
            style_window(handle, &label).expect("failed to style newly-created window");
        }
    }
    
    
}

// async fn open_window(window: tauri::Window, label: &str, title: &str) {
//     let handle = &window.app_handle();

//     let docs_window = tauri::WindowBuilder::new(
//         handle,
//         "external", /* the unique window label */
//         tauri::WindowUrl::External("https://tauri.app/".parse().unwrap())
//       ).build().unwrap();

    // tauri::WindowBuilder::new(
    //     handle,
    //     "external", /* the unique window label */
    //     tauri::WindowUrl::External("https://tauri.app/".parse().unwrap())
    // )
    //     .decorations(true)
    //     .transparent(true)
    //     .resizable(true).
    //     fullscreen(false)
    //     .focused(true)
    //     .title(title)
    //     .build()
    //     .unwrap();
// }

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
fn set_decorations(window: tauri::Window, decorations: bool) {
    window.set_decorations(decorations)
        .expect("failed to change decorations status");
}

// Gets the windows accent color.
fn get_window_accent_color() -> u32 {
    let hkcu = RegKey::predef(winreg::enums::HKEY_CURRENT_USER);
    let dwm = hkcu.open_subkey("SOFTWARE\\Microsoft\\Windows\\DWM")
        .expect("error while getting DWM registry");

    let color_accent: u32 = dwm.get_value("AccentColor").unwrap_or(0xffb93854);
    return color_accent;
}

/// Gets the correct accent color for the window border based on whether it
/// is active or inactive. Specify `transparent` as `false` to get
/// a solid color that can be used for borders.
fn get_window_border_color(active: bool, transparent: bool, theme: tauri::Theme) -> u32 {
    let hkcu = RegKey::predef(winreg::enums::HKEY_CURRENT_USER);
    let dwm = hkcu.open_subkey("SOFTWARE\\Microsoft\\Windows\\DWM")
        .expect("error while getting DWM registry");

    // read whether window border colors are enabled
    let color_prevalence: u32 = dwm.get_value("ColorPrevalence").unwrap_or(0);

    if color_prevalence == 1 && active == true {
        let color_accent = get_window_accent_color();
        if transparent { 
            return color_accent;
        } else { 
            return color_accent - 4278190080;
        }
    } else {
        if transparent {
            if theme == tauri::Theme::Dark {
                return 0xff383838;
            } else {
                return 0xffb5b5b5;
            }
        } else {
            if theme == tauri::Theme::Dark {
                return 0x00383838;
            } else {
                return 0x00b5b5b5;
            }
        }
    }
}

/// Gets the theme mode for a window: Light or Dark.
///
/// If a theme mode cannot be found, it defaults to light.
fn get_theme(window: &tauri::Window) -> tauri::Theme {
    let theme = window.theme().unwrap_or_else(|_| { tauri::Theme::Light });
    return theme
}

#[tauri::command]
fn set_window_color(window: tauri::Window, active: bool) {
    use raw_window_handle::HasRawWindowHandle;
    
    match window.raw_window_handle() {
        #[cfg(target_os = "windows")]
        raw_window_handle::RawWindowHandle::Win32(handle) => {
            let theme = get_theme(&window);
            let border_color = get_window_border_color(active, false, theme);

            use windows::Win32::{
                Graphics::Dwm::{
                    DwmSetWindowAttribute,
                    DWMWA_BORDER_COLOR,
                },
                Foundation::HWND
            };
        
            unsafe {
                // convice rust that handle.hwnd is actually of type HWND
                let hwnd: HWND = std::mem::transmute(handle.hwnd);

                // set the border color
                DwmSetWindowAttribute(
                    hwnd,
                    DWMWA_BORDER_COLOR,
                    &border_color as *const _ as _,
                    std::mem::size_of::<u32>().try_into().unwrap()
                ).unwrap_or_else(|err| println!("{:?}", err));
            }
        }
        _ => {},
    }

}

#[tauri::command]
fn get_accent_color(window: tauri::Window) -> String {
    use raw_window_handle::HasRawWindowHandle;

    let theme = get_theme(&window);
    let default_light_mode_accent = "rgb(84, 56, 185)";
    let default_dark_mode_accent = "rgb(181, 173, 235)";
    
    match window.raw_window_handle() {
        #[cfg(target_os = "windows")]
        raw_window_handle::RawWindowHandle::Win32(_) => {
            use windows::UI::ViewManagement::{ UISettings, UIColorType };
            let ui_settings = UISettings::new()
                .expect("error getting ui settings");

            if theme == tauri::Theme::Dark {
                match ui_settings.GetColorValue(UIColorType::AccentLight2) {
                    Ok(color) => {
                        return format!("rgb({}, {}, {})", color.R, color.G, color.B);
                    }
                    _ => {
                        return default_dark_mode_accent.to_owned();
                    }
                }
            } else {
                match ui_settings.GetColorValue(UIColorType::Accent) {
                    Ok(color) => {
                        return format!("rgb({}, {}, {})", color.R, color.G, color.B);
                    }
                    _ => {
                        return default_light_mode_accent.to_owned();
                    }
                }
            }
        }
        _ => {
            if theme == tauri::Theme::Dark {
                return default_dark_mode_accent.to_owned();
            } else {
                return default_light_mode_accent.to_owned();
            }
        },
    }

}
