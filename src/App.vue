<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <span class="logo">
          BYCICLE RIDE
        </span>
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/vuetifyjs/vuetify/releases/latest"
        target="_blank"
        text
      >
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <v-row md="10" justify="center">
          <v-col md="4" class="autocomplete-points">
            <v-autocomplete
              v-model="pointA"
              item-text="place_name_uk"
              :items="itemsA"
              item-value="item"
              return-object
              outlined
              label="Точка А"
              required
              @update:search-input="geocodingA"
            >
            </v-autocomplete>
          </v-col>
          <v-col md="4" class="autocomplete-points">
            <v-autocomplete
              v-model="pointB"
              item-text="place_name_uk"
              :items="itemsB"
              item-value="item"
              return-object
              outlined
              label="Точка B"
              required
              @update:search-input="geocodingB"
            >
            </v-autocomplete>
          </v-col>
        </v-row>
        <v-row md="10" justify="center">
          <v-col md="10" class="justify-center">
            <div class="map-containter">
              <div id="map"></div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
// import debounce from 'lodash/debounce';

const MAX_BOUNDS = [22.10166, 44.02738, 40.25842, 52.42326]; // Ukraine
const ACCESS_TOKEN = 'pk.eyJ1Ijoib2tvdmFsc2t5aSIsImEiOiJjbGRtdzFlZm4wZGo3M3JvbGpleHpvN21tIn0._Y-MbCc9-5p1KJiH2TudiQ';

export default {
  name: 'App',
  data() {
    return {
      pointA: null,
      pointACoords: null,
      itemsA: [],
      itemsB: [],
      pointB: '',
      pointBCoords: null,
      selectAIsOpen: false,
      selectBIsOpen: false,
      directionGeometry: null,
    };
  },
  watch: {
    pointA() {
      const { center } = this.pointA;
      const [lat, lng] = center;
      this.pointACoords = {
        lng,
        lat,
      };
    },
    pointB() {
      const { center } = this.pointB;
      const [lat, lng] = center;
      this.pointBCoords = {
        lng,
        lat,
      };
    },
    pointACoords() {
      if (this.markerA) {
        this.markerA.remove();
      }

      this.map.flyTo({
        center: [this.pointACoords.lat, this.pointACoords.lng],
        essential: true,
      });
      this.markerA = new mapboxgl.Marker({ color: 'red', draggable: false })
        .setLngLat([this.pointACoords.lat, this.pointACoords.lng])
        .addTo(this.map);
      if (this.pointACoords && this.pointBCoords) {
        this.direction(this.pointACoords, this.pointBCoords);
      }
    },
    pointBCoords() {
      if (this.markerB) {
        this.markerB.remove();
      }
      this.markerB = new mapboxgl.Marker({ color: 'blue', draggable: false })
        .setLngLat([this.pointBCoords.lat, this.pointBCoords.lng])
        .addTo(this.map);

      if (this.pointACoords && this.pointBCoords) {
        this.direction(this.pointACoords, this.pointBCoords);
      }
    },
    directionGeometry(geom) {
      if (geom) {
        this.addDirectionLayer();
      }
    },
  },
  methods: {
    geocodingA(text) {
      return axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=${ACCESS_TOKEN}&bbox=${MAX_BOUNDS.join(',')}&language=uk`)
        .then((response) => {
          if (response && response.data) {
            if (response.data.features && response.data.features.length) {
              this.itemsA = response.data.features;
            }
          }
        });
    },
    geocodingB(text) {
      return axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=${ACCESS_TOKEN}&bbox=${MAX_BOUNDS.join(',')}&language=uk`)
        .then((response) => {
          if (response && response.data) {
            if (response.data.features && response.data.features.length) {
              this.itemsB = response.data.features;
            }
          }
        });
    },
    direction(a, b) {
      return axios.get(`https://api.mapbox.com/directions/v5/mapbox/cycling/${a.lat},${a.lng};${b.lat},${b.lng}?geometries=geojson&access_token=${ACCESS_TOKEN}`)
        .then((response) => {
          if (response && response.data) {
            const { routes } = response.data;
            if (routes && routes.length) {
              const [route] = routes;
              this.directionGeometry = route.geometry;
            }
          }
        });
    },
    addDirectionLayer() {
      const directionSource = this.map.getSource('direction');

      if (!directionSource) {
        const direction = {
          type: 'geojson',
          data: this.directionGeometry,
        };
        this.map.addSource('direction', direction);

        this.map.addLayer({
          id: 'directionLayer',
          type: 'line',
          source: 'direction',
          paint: {
            'line-color': '#ff0000', // Колір лінії
            'line-width': 2,
          },
          layout: {
            visibility: 'visible',
          },
        });
      } else {
        this.map.removeLayer('directionLayer');
        this.map.removeSource('direction');
        const direction = {
          type: 'geojson',
          data: this.directionGeometry,
        };
        this.map.addSource('direction', direction);

        this.map.addLayer({
          id: 'directionLayer',
          type: 'line',
          source: 'direction',
          paint: {
            'line-color': '#ff0000', // Колір лінії
            'line-width': 2,
          },
          layout: {
            visibility: 'visible',
          },
        });
      }
    },
  },
  mounted() {
    mapboxgl.accessToken = ACCESS_TOKEN;
    this.map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/streets-v11',
      container: 'map',
      center: [28.469688, 49.232768], // Координати центру карти (довгота, широта)
      zoom: 12, // Початкове збільшення карти
      maxBounds: MAX_BOUNDS,
      antialias: true,
    });
    // this.debounceGeocoding = debounce(this.geocoding, 500);
  },
};
</script>
<style>

#map {
  width: 100%;
  height: 60vh;
}
</style>
