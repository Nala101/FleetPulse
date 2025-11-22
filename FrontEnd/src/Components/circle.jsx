/**
 * Copyright 2024 Google LLC
 */

// just removed the type script stuff and turned it back into normal js

import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import {
  GoogleMapsContext,
  latLngEquals,
} from "@vis.gl/react-google-maps";

function useCircle(props) {
  const {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
    onRadiusChanged,
    onCenterChanged,
    radius,
    center,
    ...circleOptions
  } = props;

  // store callbacks without causing re-render loops
  const callbacks = useRef({});
  Object.assign(callbacks.current, {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
    onRadiusChanged,
    onCenterChanged,
  });

  const circle = useRef(
    new google.maps.Circle()
  ).current;

  // update circle options
  circle.setOptions(circleOptions);

  // update center
  useEffect(() => {
    if (!center) return;
    if (
      !latLngEquals(center, circle.getCenter())
    ) {
      circle.setCenter(center);
    }
  }, [center]);

  // update radius
  useEffect(() => {
    if (radius === undefined || radius === null)
      return;
    if (radius !== circle.getRadius()) {
      circle.setRadius(radius);
    }
  }, [radius]);

  const map = useContext(GoogleMapsContext)?.map;

  // add to map
  useEffect(() => {
    if (!map) {
      if (map === undefined) {
        console.error(
          "<Circle> must be inside a <Map> component."
        );
      }
      return;
    }

    circle.setMap(map);

    return () => {
      circle.setMap(null);
    };
  }, [map]);

  // attach event listeners
  useEffect(() => {
    if (!circle) return;

    const gme = google.maps.event;

    const events = [
      ["click", "onClick"],
      ["drag", "onDrag"],
      ["dragstart", "onDragStart"],
      ["dragend", "onDragEnd"],
      ["mouseover", "onMouseOver"],
      ["mouseout", "onMouseOut"],
    ];

    events.forEach(([eventName, handler]) => {
      gme.addListener(circle, eventName, (e) => {
        const cb = callbacks.current[handler];
        if (cb) cb(e);
      });
    });

    gme.addListener(
      circle,
      "radius_changed",
      () => {
        const newRadius = circle.getRadius();
        if (callbacks.current.onRadiusChanged) {
          callbacks.current.onRadiusChanged(
            newRadius
          );
        }
      }
    );

    gme.addListener(
      circle,
      "center_changed",
      () => {
        const newCenter = circle.getCenter();
        if (callbacks.current.onCenterChanged) {
          callbacks.current.onCenterChanged(
            newCenter
          );
        }
      }
    );

    return () => {
      gme.clearInstanceListeners(circle);
    };
  }, [circle]);

  return circle;
}

export const Circle = forwardRef((props, ref) => {
  const circle = useCircle(props);

  useImperativeHandle(ref, () => circle);

  return null;
});
