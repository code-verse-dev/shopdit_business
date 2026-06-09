import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { Input, InputRef, Tag } from "antd";
import { useEffect, useRef, useState } from "react";

export interface GoogleBusinessSearchProps {
  onBusinessSelect: (placeId: string | null) => void;
}

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export function GoogleBusinessSearch({ onBusinessSelect }: GoogleBusinessSearchProps) {
  const inputRef = useRef<InputRef>(null);
  const [apiReady, setApiReady] = useState(false);
  const [inputReady, setInputReady] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (inputRef.current?.input) setInputReady(true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [selectedName]);

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
    if (!apiReady || !inputReady || selectedName) return;

    const inputEl = inputRef.current?.input;
    if (!inputEl || !google.maps?.places) return;

    const autocomplete = new google.maps.places.Autocomplete(inputEl, {
      types: ["establishment"],
      fields: ["place_id", "name"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const placeId = place.place_id;
      const name = place.name;
      if (placeId && name) {
        setSelectedName(name);
        setSearchValue("");
        onBusinessSelect(placeId);
      }
    });

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [apiReady, inputReady, selectedName, onBusinessSelect]);

  const handleClear = () => {
    setSelectedName(null);
    setSearchValue("");
    onBusinessSelect(null);
  };

  if (selectedName) {
    return (
      <Tag
        closable
        onClose={(e) => {
          e.preventDefault();
          handleClear();
        }}
        className="!inline-flex !items-center !gap-1 !rounded-full !border !border-green-200 !bg-green-50 !px-3 !py-1.5 !text-sm !text-green-800 dark:!border-green-800 dark:!bg-green-900/20 dark:!text-green-300"
      >
        {selectedName}
      </Tag>
    );
  }

  return (
    <Input
      ref={inputRef}
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      placeholder="Search your business on Google (optional)"
      className="web-input"
      autoComplete="off"
    />
  );
}
