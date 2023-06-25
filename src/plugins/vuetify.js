import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import uk from 'vuetify/lib/locale/uk';

Vue.use(Vuetify);

export default new Vuetify({
  lang: {
    locales: { uk },
    current: 'uk',
  },
});
