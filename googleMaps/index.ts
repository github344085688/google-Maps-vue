import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import template from "./googleMap.vue";
import { map, partialRight, pick, find } from 'lodash-es';

@Component({
  mixins: [template],
})
export default class GoogleMaps extends Vue {
    @Prop({default: {}})
    centerLocation: any;

    @Prop({default: []})
    locations: Array<any>;

    center: any = {};
    map: google.maps.Map;
    positionsMarkers: Array<any> = [];
    markers: google.maps.Marker[] = [];
    flightPath: google.maps.Polyline;
    polylines: Array<any> = [];


    @Watch('centerLocation')
    getCenter(val: any, oldVal: any) {
        if (val) {
            this.center = this.centerLocation;
            this.panTo(val);
        }
    }


    @Watch('locations')
    getmarkers(val: any, oldVal: any) {
        if (val) {
            console.log(val);
            this.polylines = map(val, partialRight(pick, ['lat', 'lng']));
            this.positionsMarkers = val;
            this.updateMap(this.center);
        }
        else this.polylines = [];
    }

    created() {

    }

    mounted() {
        this.center = this.centerLocation;
        this.positionsMarkers = this.locations;
        this.polylines = map(this.locations, partialRight(pick, ['lat', 'lng']));
        this.initMap();

    }

    initMap(): void {
        this.map = new google.maps.Map(
            document.getElementById("map") as HTMLElement,
            {
                zoom: 12,
                center: this.center,
                streetViewControl: false,
                mapTypeControlOptions: {
                    mapTypeIds: ["roadmap"],
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                },
                styles: [
                    {elementType: "geometry", stylers: [{color: "#2e2e2e"}]},
                    {elementType: "labels.text.stroke", stylers: [{color: "#2e2e2e"}]},
                    {elementType: "labels.text.fill", stylers: [{color: "#383838"}]},
                    {
                        featureType: "administrative.locality",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#696969"}],
                    },
                    {
                        featureType: "poi",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#696969"}],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "geometry",
                        stylers: [{color: "#2e2e2e"}],
                    },
                    {
                        featureType: "poi.park",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#383838"}],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry",
                        stylers: [{color: "#383838"}],
                    },
                    {
                        featureType: "road",
                        elementType: "geometry.stroke",
                        stylers: [{color: "#212a37"}],
                    },
                    {
                        featureType: "road",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#9ca5b3"}],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry",
                        stylers: [{color: "#696969"}],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "geometry.stroke",
                        stylers: [{color: "#1f2835"}],
                    },
                    {
                        featureType: "road.highway",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#696969"}],
                    },
                    {
                        featureType: "transit",
                        elementType: "geometry",
                        stylers: [{color: "#2f3948"}],
                    },
                    {
                        featureType: "transit.station",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#696969"}],
                    },
                    {
                        featureType: "water",
                        elementType: "geometry",
                        stylers: [{color: "#17263c"}],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.fill",
                        stylers: [{color: "#515c6d"}],
                    },
                    {
                        featureType: "water",
                        elementType: "labels.text.stroke",
                        stylers: [{color: "#17263c"}],
                    },
                ],
            }
        );
        this.setMarkers();
        this.setPolyline();

    }

    private svgMarker(state: string) {
        if (state == 'finish') return {
            path: "M21 12C21 18.1588 16.4427 23 11 23C5.55728 23 1 18.1588 1 12C1 5.84118 5.55728 1 11 1C16.4427 1 21 5.84118 21 12Z",
            strokeColor: "#FFFFFF",
            fillColor: "#CAEDE4",
            fillOpacity: 1,
            strokeWeight: 4,
            rotation: 0,
            scale: 1,
            anchor: new google.maps.Point(12, 15),
        };
        if (state == 'continuous') return {
            path: "M21 12C21 18.1588 16.4427 23 11 23C5.55728 23 1 18.1588 1 12C1 5.84118 5.55728 1 11 1C16.4427 1 21 5.84118 21 12Z",
            strokeColor: "#CAEDE4",
            fillColor: "#52AB98",
            fillOpacity: 1,
            strokeWeight: 4,
            rotation: 0,
            scale: 1,
            anchor: new google.maps.Point(12, 15),
        };
    }

    private setMarkers(): void {
        this.positionsMarkers.forEach((i: any) => {
            const marker = new google.maps.Marker({
                position: {lat: i['lat'], lng: i['lng']},
                icon: this.svgMarker(i['state']),
                // draggable: true,
                map: this.map,
            });
            this.markers.push(marker);
        });

    }

    private setPolyline(): void {
        this.flightPath = new google.maps.Polyline({
            path: this.polylines,
            strokeColor: "#ABE2D6",
            strokeOpacity: 0,
            icons: [
                {
                    icon: {
                        path: "M 0,-1 0,1",
                        strokeOpacity: 1,
                        scale: 5,
                    },
                    offset: "0",
                    repeat: "20px",
                },
            ],
            map: this.map,
        });

    }

    updateMap(panTo: any) {
        this.panTo(panTo);
        this.clearMarkers();
        this.clearFlightPath();
        this.setMarkers();
        this.setPolyline();
    }

    private panTo(panTo: any) {
        this.map.panTo(panTo);
    }

    private clearFlightPath(): void {
        this.flightPath.setMap(null);
    }

    private clearMarkers(): void {
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
        this.markers = [];
    }
}