import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { Input, InputRef } from "antd";
import { useEffect, useRef, useState } from "react";

export interface PlaceLocation {
  type: "Point";
  coordinates: [number, number];
  address: string;
}

export interface GooglePlacesSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  onPlaceSelect?: (location: PlaceLocation) => void;
  /** Called when the user types so callers can clear stale coordinates */
  onClearGeo?: () => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export function GooglePlacesSearch({
  value,
  onChange,
  onPlaceSelect,
  onClearGeo,
  placeholder,
  disabled,
  id,
  className,
}: GooglePlacesSearchProps) {
  const inputRef = useRef<InputRef>(null);
  const [apiReady, setApiReady] = useState(false);
  const [inputReady, setInputReady] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (inputRef.current?.input) setInputReady(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!apiKey) return;

    let cancelled = false;

    setOptions({ key: apiKey, v: "weekly" });

    importLibrary("places")
      .then(() => {
        if (!cancelled) setApiReady(true);
      })
      .catch(() => {
        /* API failed to load; input still works as plain text */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!apiReady || !inputReady) return;

    const inputEl = inputRef.current?.input;
    if (!inputEl || !google.maps?.places) return;

    const autocomplete = new google.maps.places.Autocomplete(inputEl, {
      types: ["address"],
      fields: ["formatted_address", "geometry"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const addr = place.formatted_address;
      const loc = place.geometry?.location;
      if (addr && loc) {
        onChange?.(addr);
        onPlaceSelect?.({
          type: "Point",
          coordinates: [loc.lng(), loc.lat()],
          address: addr,
        });
      }
    });

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [apiReady, inputReady, onChange, onPlaceSelect]);

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => {
        const v = e.target.value;
        onChange?.(v);
        onClearGeo?.();
      }}
      placeholder={placeholder}
      disabled={disabled}
      id={id}
      className={className}
      autoComplete="off"
    />
  );
}
