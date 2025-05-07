import { useQuery } from "@tanstack/react-query";
import { fetchSoilData } from "../services/soilService";

export const useSoilLayer = (coordinates) => {
  return useQuery({
    queryKey: ["soil-layer", coordinates?.latitude, coordinates?.longitude],
    queryFn: () => fetchSoilData(coordinates.latitude, coordinates.longitude),
    enabled: !!coordinates,
    select: (data) => {
      // Your logic to determine dominant soil property
      if (data?.properties?.oc?.mean > 20) return "organic";
      if (data?.properties?.phh2o?.mean < 5.5) return "acidic";
      return "mineral";
    },
  });
};
