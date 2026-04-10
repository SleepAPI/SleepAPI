import '@mdi/font/css/materialdesignicons.css';
import type { EnhanceAppContext } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import AboutAuthor from './components/AboutAuthor.vue';
import GuideDemoComponent from './components/GuideDemoComponent.vue';
import GuideEmoji from './components/GuideEmoji.vue';
import GuideEmojiCatalog from './components/GuideEmojiCatalog.vue';
import SubjectiveInfoBanner from './components/SubjectiveInfoBanner.vue';
import BerryStrengthComponent from './components/TierLists/BerryStrengthComponent.vue';
import Layout from './Layout.vue';
import './style.scss';
import vuetify from './vuetify';

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.use(vuetify);
    app.component('GuideEmoji', GuideEmoji);
    app.component('GuideEmojiCatalog', GuideEmojiCatalog);
    app.component('GuideDemoComponent', GuideDemoComponent);
    app.component('SubjectiveInfoBanner', SubjectiveInfoBanner);
    app.component('AboutAuthor', AboutAuthor);
    app.component('BerryStrengthComponent', BerryStrengthComponent);
  }
};
