"use client";

import "leaflet/dist/leaflet.css";

import { divIcon } from "leaflet";
import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

export interface SiagaMapLocation {
  latitude: number;
  longitude: number;
}

export interface SiagaMapItem {
  organizationId: string;
  organizationName: string;
  serviceId: string;
  serviceName: string;
  latitude: number | null;
  longitude: number | null;
  publicAddress: string | null;
  district: string | null;
  city: string;
  province: string;
}

export interface SiagaMapPlace {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
  openingHours: string | null;
  sourceLabel: string;
  sourceUrl: string | null;
  verifiedByHelpMe: false;
}

type LocatedItem = SiagaMapItem & {
  latitude: number;
  longitude: number;
};

const SURABAYA_CENTER: [number, number] = [-7.2575, 112.7521];

const partnerIcon = divIcon({
  className: "helpme-siaga-partner-marker",
  html: '<span style="display:block;width:22px;height:22px;border:3px solid white;border-radius:50%;background:#059669;box-shadow:0 2px 7px rgba(15,23,42,.35)"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -11],
});

const publicPlaceIcon = divIcon({
  className: "helpme-siaga-public-place-marker",
  html: '<span style="display:block;width:20px;height:20px;border:3px solid white;border-radius:50%;background:#2563eb;box-shadow:0 2px 7px rgba(15,23,42,.35)"></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -10],
});

function MapViewport({
  positions,
  userLocation,
}: {
  positions: [number, number][];
  userLocation: SiagaMapLocation | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 13);
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 14);
    } else if (positions.length > 1) {
      map.fitBounds(positions, {
        padding: [24, 24],
        maxZoom: 14,
      });
    }
  }, [map, positions, userLocation]);

  return null;
}

export default function SiagaMap({
  items,
  places,
  userLocation,
}: {
  items: SiagaMapItem[];
  places: SiagaMapPlace[];
  userLocation: SiagaMapLocation | null;
}) {
  const locatedItems = useMemo(
    () =>
      items.filter(
        (item): item is LocatedItem =>
          typeof item.latitude === "number" &&
          Number.isFinite(item.latitude) &&
          item.latitude >= -90 &&
          item.latitude <= 90 &&
          typeof item.longitude === "number" &&
          Number.isFinite(item.longitude) &&
          item.longitude >= -180 &&
          item.longitude <= 180,
      ),
    [items],
  );

  const positions = useMemo<[number, number][]>(
    () => [
      ...locatedItems.map(
        (item): [number, number] => [item.latitude, item.longitude],
      ),
      ...places.map(
        (place): [number, number] => [place.latitude, place.longitude],
      ),
    ],
    [locatedItems, places],
  );

  const initialCenter: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : SURABAYA_CENTER;

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={initialCenter}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewport positions={positions} userLocation={userLocation} />

        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={publicPlaceIcon}
            title={place.name}
          >
            <Popup>
              <div className="min-w-40">
                <p className="font-bold">{place.name}</p>
                <p className="mt-1 text-xs text-blue-700">
                  Lokasi OpenStreetMap
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Belum diverifikasi oleh HelpMe.
                </p>
                {place.address && (
                  <p className="mt-1 text-xs text-slate-600">{place.address}</p>
                )}
                {place.sourceUrl && (
                  <a
                    href={place.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-bold text-blue-700"
                  >
                    Lihat sumber peta
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {locatedItems.map((item) => {
          const address = [
            item.publicAddress,
            item.district ? "Kecamatan " + item.district : null,
            item.city,
            item.province,
          ]
            .filter(
              (part): part is string =>
                typeof part === "string" && part.trim().length > 0,
            )
            .join(", ");

          return (
            <Marker
              key={item.organizationId + "-" + item.serviceId}
              position={[item.latitude, item.longitude]}
              icon={partnerIcon}
              title={item.serviceName}
            >
              <Popup>
                <div className="min-w-40">
                  <p className="font-bold">{item.serviceName}</p>
                  <p className="mt-1 text-sm">{item.organizationName}</p>
                  <p className="mt-1 text-xs font-bold text-emerald-700">
                    Mitra Terverifikasi HelpMe
                  </p>
                  {address && (
                    <p className="mt-1 text-xs text-slate-600">{address}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {userLocation && (
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={8}
            pathOptions={{
              color: "#4c1d95",
              weight: 3,
              fillColor: "#8b5cf6",
              fillOpacity: 1,
            }}
          >
            <Popup>Lokasi perangkat Anda</Popup>
          </CircleMarker>
        )}
      </MapContainer>

      <div className="pointer-events-none absolute bottom-3 left-3 z-1000 flex flex-wrap gap-2 rounded-lg border border-white/80 bg-white/95 p-2 text-[8px] font-semibold shadow-sm backdrop-blur">
        <span className="inline-flex items-center gap-1.5 text-slate-700">
          <span
            className="h-2.5 w-2.5 rounded-full border border-violet-900 bg-violet-500"
            aria-hidden="true"
          />
          Anda
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-700">
          <span
            className="h-2.5 w-2.5 rounded-full bg-blue-600"
            aria-hidden="true"
          />
          Lokasi peta
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-700">
          <span
            className="h-2.5 w-2.5 rounded-full bg-emerald-600"
            aria-hidden="true"
          />
          Terverifikasi
        </span>
      </div>
    </div>
  );
}
