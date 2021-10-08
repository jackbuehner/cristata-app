import { db } from '../utils/axios/db';
import {
  Balloon16Regular,
  BookGlobe24Regular,
  Chat24Regular,
  Cookies24Regular,
  DocumentOnePage24Regular,
  DocumentPageBottomRight24Regular,
  Image24Regular,
  ImageSearch24Regular,
  News24Regular,
  PaintBrush24Regular,
  PersonBoard24Regular,
  Sport24Regular,
  Star24Regular,
  StarEmphasis24Regular,
} from '@fluentui/react-icons';
import { AxiosResponse } from 'axios';

interface Ifeatures {
  [key: string]: boolean | { [key: string]: boolean };
}

const features: Ifeatures = {
  cms: true,
  messages: false,
  plans: true,
  profiles: true,
};

interface Ihome {
  recentItems: Array<{
    label: string;
    icon: React.ReactElement;
    data: () => Promise<AxiosResponse<Record<string, any>[]>>;
    toPrefix: string;
    isProfile?: boolean;
    keys:
      | {
          name: string;
          lastModified: string;
          photo?: string;
          description?: string;
          toSuffix: string;
          history: string;
        }
      | {
          name: string;
          lastModified: string;
          photo?: string;
          description?: string;
          toSuffix: string;
          lastModifiedBy: string;
        };
  }>;
}

const home: Ihome = {
  recentItems: [
    {
      label: 'Articles',
      icon: <News24Regular />,
      data: async () => await db.get(`/articles?historyType=patched&historyType=created`),
      toPrefix: '/cms/item/articles/',
      keys: {
        photo: 'photo_path',
        name: 'name',
        history: 'history',
        lastModified: 'timestamps.modified_at',
        description: 'description',
        toSuffix: '_id',
      },
    },
    {
      label: 'Profiles',
      icon: <PersonBoard24Regular />,
      data: async () => await db.get(`/users`),
      toPrefix: '/profile/',
      keys: {
        name: 'name',
        lastModified: 'timestamps.last_login_at',
        lastModifiedBy: 'people.last_modified_by',
        toSuffix: '_id',
      },
      isProfile: true,
    },
    {
      label: 'Photo requests',
      icon: <ImageSearch24Regular />,
      data: async () => await db.get(`/photo-requests?historyType=patched&historyType=created`),
      toPrefix: '/cms/item/photo-requests/',
      keys: {
        name: 'name',
        history: 'history',
        lastModified: 'timestamps.modified_at',
        toSuffix: '_id',
      },
    },
  ],
};

interface Inavigation {
  cms: INavGroup[];
}

interface INavGroup {
  label: string;
  items: INavItem[];
}

interface INavItem {
  label: string;
  icon: JSX.Element;
  to: string;
  isHidden?: boolean;
}

const navigation: Inavigation = {
  cms: [
    {
      label: `Articles`,
      items: [
        {
          label: `In-progress articles`,
          icon: <DocumentPageBottomRight24Regular />,
          to: `/cms/articles/in-progress`,
        },
        { label: `All articles`, icon: <DocumentOnePage24Regular />, to: `/cms/articles/all` },
        {
          label: `News articles (in-progress)`,
          icon: <News24Regular />,
          to: `/cms/articles/in-progress?category=news`,
        },
        {
          label: `Opinions (in-progress)`,
          icon: <Chat24Regular />,
          to: `/cms/articles/in-progress?category=opinion`,
        },
        {
          label: `Sports articles (in-progress)`,
          icon: <Sport24Regular />,
          to: `/cms/articles/in-progress?category=sports`,
        },
        {
          label: `Diversity matters articles (in-progress)`,
          icon: <Star24Regular />,
          to: `/cms/articles/in-progress?category=diversity%20matters`,
        },
        {
          label: `Arts articles (in-progress)`,
          icon: <PaintBrush24Regular />,
          to: `/cms/articles/in-progress?category=arts`,
        },
        {
          label: `Campus & culture articles (in-progress)`,
          icon: <Balloon16Regular />,
          to: `/cms/articles/in-progress?category=campus%20%26%20culture`,
        },
      ],
    },
    {
      label: `Photos`,
      items: [
        {
          label: `Unfulfilled photo requests`,
          icon: <ImageSearch24Regular />,
          to: `/cms/photos/requests/unfulfilled`,
        },
        {
          label: `All photo requests`,
          icon: <ImageSearch24Regular />,
          to: `/cms/photos/requests/all`,
        },
        {
          label: `Photo library`,
          icon: <Image24Regular />,
          to: `/cms/photos/library`,
        },
      ],
    },
    {
      label: `Satire`,
      items: [
        {
          label: `In-progress satire`,
          icon: <DocumentPageBottomRight24Regular />,
          to: `/cms/satire/in-progress`,
        },
        {
          label: `All satire`,
          icon: <Cookies24Regular />,
          to: `/cms/satire/all`,
        },
      ],
    },
    {
      label: `Short URLs`,
      items: [
        {
          label: `flusher.page`,
          icon: <BookGlobe24Regular />,
          to: `/cms/shorturls`,
          isHidden: !JSON.parse(localStorage.getItem('auth.user') as string)?.teams.includes(
            'MDQ6VGVhbTQ2NDI0MTc='
          ),
        },
      ],
    },
    {
      label: `Configuration`,
      items: [
        {
          label: `Featured articles`,
          icon: <StarEmphasis24Regular />,
          to: `/cms/item/featured-settings/6101da4a5386ae9ea3147f17`,
          isHidden: !JSON.parse(localStorage.getItem('auth.user') as string)?.teams.includes(
            'MDQ6VGVhbTQ2NDI0MTc='
          ),
        },
      ],
    },
  ],
};

export { collections } from './collections';
export { features, home, navigation };
export type { tiptapOptions } from './collections';
