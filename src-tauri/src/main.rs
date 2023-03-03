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
            let main_window = app.get_window("main").unwrap();

            #[cfg(target_os = "windows")]
            // read system info from the registry
            let hklm = RegKey::predef(winreg::enums::HKEY_LOCAL_MACHINE);
            let cur_ver = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion")?;
            let reg_build_number: String = cur_ver.get_value("CurrentBuildNumber")?;
            let build_number: u32 = reg_build_number.parse().unwrap();
            let reg_current_version: String = cur_ver.get_value("CurrentVersion")?;

            // only apply vibrancy if windows 11 or higher
            if build_number > 22000 && reg_current_version == "6.3" {
                window_vibrancy::apply_mica(&main_window)
                .expect("Unsupported platform! 'apply_mica' is only supported on Windows");
            
                // we must minimize and maximize to force mica to apply
                main_window.minimize().unwrap();
                main_window.unminimize().unwrap();
                main_window.maximize().unwrap();
                main_window.unmaximize().unwrap();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    println!("Tauri main function running");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
