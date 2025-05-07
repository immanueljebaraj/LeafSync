const CACHE = {};

export const fetchSoilData = async (lat, lng) => {
  const cacheKey = `${lat.toFixed(4)}_${lng.toFixed(4)}`;

  if (CACHE[cacheKey]) {
    return CACHE[cacheKey];
  }

  try {
    const response = await fetch(
      `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lng}&lat=${lat}&property=oc&property=phh2o&property=nitrogen&property=sand&depth=0-5cm&value=mean`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    const result = {
      organicCarbon: data.properties.oc.mean,
      ph: data.properties.phh2o.mean,
      nitrogen: data.properties.nitrogen.mean,
      sand: data.properties.sand.mean,
      lastUpdated: new Date().toISOString(),
    };

    CACHE[cacheKey] = result;
    return result;
  } catch (error) {
    console.error("SoilGrids API error:", error);
    return {
      organicCarbon: null,
      ph: null,
      nitrogen: null,
      sand: null,
      error: error.message,
    };
  }
};

export const calculateSoilHealth = (soilData) => {
  if (!soilData || soilData.error) return null;

  const { organicCarbon, ph, nitrogen } = soilData;
  let score = 50;

  score += Math.min(organicCarbon / 0.2, 50);
  score -= Math.abs(ph - 6.5) * 10;
  score += nitrogen * 100;

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const getDominantSoilProperty = (soilData) => {
  if (!soilData || soilData.error) return "organic";

  const { organicCarbon, ph, sand } = soilData;

  if (organicCarbon > 20) return "organic";
  if (ph < 5.5) return "acidic";
  if (sand > 70) return "sandy";
  return "mineral";
};
