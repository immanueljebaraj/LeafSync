import { useQuery } from '@tanstack/react-query';
import { fetchSoilData } from '../services/soilService';

export const useSoilData = (coordinates) => {
  return useQuery({
    queryKey: ['soil-data', coordinates?.latitude, coordinates?.longitude],
    queryFn: () => coordinates ? fetchSoilData(coordinates.latitude, coordinates.longitude) : null,
    enabled: !!coordinates,
    select: (data) => ({
      organicCarbon: data?.properties?.oc?.mean?.toFixed(1),
      ph: data?.properties?.phh2o?.mean?.toFixed(1),
      nitrogen: data?.properties?.nitrogen?.mean?.toFixed(2),
      sand: data?.properties?.sand?.mean?.toFixed(0)
    })
  });
};