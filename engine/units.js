/**
 * Scientific Calculator Engine - Comprehensive Unit Converter & Natural Language Matcher
 * Supports 12 categories, accurate physical constants, and natural language queries.
 */

export class UnitEngine {
    static categories = {
        length: {
            name: 'Length',
            base: 'm',
            units: {
                mm: { label: 'Millimeter (mm)', factor: 0.001, aliases: ['millimeter', 'millimeters', 'mm'] },
                cm: { label: 'Centimeter (cm)', factor: 0.01, aliases: ['centimeter', 'centimeters', 'cm'] },
                m: { label: 'Meter (m)', factor: 1, aliases: ['meter', 'meters', 'm'] },
                km: { label: 'Kilometer (km)', factor: 1000, aliases: ['kilometer', 'kilometers', 'km'] },
                in: { label: 'Inch (in)', factor: 0.0254, aliases: ['inch', 'inches', 'in', '"'] },
                ft: { label: 'Foot (ft)', factor: 0.3048, aliases: ['foot', 'feet', 'ft', "'"] },
                yd: { label: 'Yard (yd)', factor: 0.9144, aliases: ['yard', 'yards', 'yd'] },
                mi: { label: 'Mile (mi)', factor: 1609.344, aliases: ['mile', 'miles', 'mi'] },
                nm: { label: 'Nautical Mile (nmi)', factor: 1852, aliases: ['nmi', 'nautical mile', 'nautical miles'] }
            }
        },
        mass: {
            name: 'Mass & Weight',
            base: 'kg',
            units: {
                mg: { label: 'Milligram (mg)', factor: 0.000001, aliases: ['milligram', 'milligrams', 'mg'] },
                g: { label: 'Gram (g)', factor: 0.001, aliases: ['gram', 'grams', 'g'] },
                kg: { label: 'Kilogram (kg)', factor: 1, aliases: ['kilogram', 'kilograms', 'kg'] },
                oz: { label: 'Ounce (oz)', factor: 0.028349523, aliases: ['ounce', 'ounces', 'oz'] },
                lb: { label: 'Pound (lb)', factor: 0.45359237, aliases: ['pound', 'pounds', 'lb', 'lbs'] },
                ton: { label: 'Metric Ton (t)', factor: 1000, aliases: ['ton', 'tons', 'tonne', 'tonnes', 't'] }
            }
        },
        temperature: {
            name: 'Temperature',
            base: 'c',
            units: {
                c: { label: 'Celsius (°C)', isTemp: true, aliases: ['c', 'celsius', '°c'] },
                f: { label: 'Fahrenheit (°F)', isTemp: true, aliases: ['f', 'fahrenheit', '°f'] },
                k: { label: 'Kelvin (K)', isTemp: true, aliases: ['k', 'kelvin'] }
            }
        },
        area: {
            name: 'Area',
            base: 'sq_m',
            units: {
                sq_m: { label: 'Square Meter (m²)', factor: 1, aliases: ['sq m', 'm2', 'm²', 'square meter'] },
                sq_km: { label: 'Square Kilometer (km²)', factor: 1e6, aliases: ['sq km', 'km2', 'km²', 'square kilometer'] },
                sq_ft: { label: 'Square Foot (ft²)', factor: 0.092903, aliases: ['sq ft', 'ft2', 'ft²', 'square foot'] },
                acre: { label: 'Acre (ac)', factor: 4046.856, aliases: ['acre', 'acres', 'ac'] },
                hectare: { label: 'Hectare (ha)', factor: 10000, aliases: ['hectare', 'hectares', 'ha'] }
            }
        },
        volume: {
            name: 'Volume',
            base: 'l',
            units: {
                ml: { label: 'Milliliter (mL)', factor: 0.001, aliases: ['ml', 'milliliter', 'milliliters'] },
                l: { label: 'Liter (L)', factor: 1, aliases: ['l', 'liter', 'liters'] },
                m3: { label: 'Cubic Meter (m³)', factor: 1000, aliases: ['m3', 'm³', 'cubic meter'] },
                gal: { label: 'US Gallon (gal)', factor: 3.78541, aliases: ['gal', 'gallon', 'gallons'] },
                qt: { label: 'US Quart (qt)', factor: 0.946353, aliases: ['qt', 'quart', 'quarts'] },
                pt: { label: 'US Pint (pt)', factor: 0.473176, aliases: ['pt', 'pint', 'pints'] },
                cup: { label: 'US Cup', factor: 0.236588, aliases: ['cup', 'cups'] },
                fl_oz: { label: 'Fluid Ounce (fl oz)', factor: 0.0295735, aliases: ['fl oz', 'floz'] }
            }
        },
        speed: {
            name: 'Speed',
            base: 'm_s',
            units: {
                m_s: { label: 'Meter per Second (m/s)', factor: 1, aliases: ['m/s', 'mps'] },
                km_h: { label: 'Kilometer per Hour (km/h)', factor: 1 / 3.6, aliases: ['km/h', 'kph', 'kmh'] },
                mph: { label: 'Mile per Hour (mph)', factor: 0.44704, aliases: ['mph', 'mi/h'] },
                knot: { label: 'Knot (kn)', factor: 0.514444, aliases: ['knot', 'knots', 'kn'] }
            }
        },
        time: {
            name: 'Time',
            base: 's',
            units: {
                ms: { label: 'Millisecond (ms)', factor: 0.001, aliases: ['ms', 'millisecond'] },
                s: { label: 'Second (s)', factor: 1, aliases: ['s', 'sec', 'second', 'seconds'] },
                min: { label: 'Minute (min)', factor: 60, aliases: ['min', 'minute', 'minutes'] },
                hr: { label: 'Hour (hr)', factor: 3600, aliases: ['hr', 'h', 'hour', 'hours'] },
                day: { label: 'Day (d)', factor: 86400, aliases: ['day', 'days', 'd'] },
                week: { label: 'Week (wk)', factor: 604800, aliases: ['week', 'weeks', 'wk'] },
                year: { label: 'Year (yr)', factor: 31536000, aliases: ['year', 'years', 'yr'] }
            }
        },
        pressure: {
            name: 'Pressure',
            base: 'pa',
            units: {
                pa: { label: 'Pascal (Pa)', factor: 1, aliases: ['pa', 'pascal'] },
                kpa: { label: 'Kilopascal (kPa)', factor: 1000, aliases: ['kpa'] },
                bar: { label: 'Bar (bar)', factor: 100000, aliases: ['bar'] },
                psi: { label: 'Pounds per Sq In (psi)', factor: 6894.757, aliases: ['psi'] },
                atm: { label: 'Atmosphere (atm)', factor: 101325, aliases: ['atm'] }
            }
        },
        energy: {
            name: 'Energy',
            base: 'j',
            units: {
                j: { label: 'Joule (J)', factor: 1, aliases: ['j', 'joule', 'joules'] },
                kj: { label: 'Kilojoule (kJ)', factor: 1000, aliases: ['kj'] },
                cal: { label: 'Calorie (cal)', factor: 4.184, aliases: ['cal', 'calorie'] },
                kcal: { label: 'Kilocalorie (kcal)', factor: 4184, aliases: ['kcal'] },
                wh: { label: 'Watt-hour (Wh)', factor: 3600, aliases: ['wh'] },
                kwh: { label: 'Kilowatt-hour (kWh)', factor: 3600000, aliases: ['kwh'] },
                ev: { label: 'Electronvolt (eV)', factor: 1.602176634e-19, aliases: ['ev'] }
            }
        },
        power: {
            name: 'Power',
            base: 'w',
            units: {
                w: { label: 'Watt (W)', factor: 1, aliases: ['w', 'watt', 'watts'] },
                kw: { label: 'Kilowatt (kW)', factor: 1000, aliases: ['kw'] },
                hp: { label: 'Horsepower (hp)', factor: 745.699872, aliases: ['hp', 'horsepower'] }
            }
        },
        data: {
            name: 'Digital Data',
            base: 'byte',
            units: {
                b: { label: 'Bit (b)', factor: 0.125, aliases: ['bit', 'bits', 'b'] },
                byte: { label: 'Byte (B)', factor: 1, aliases: ['byte', 'bytes', 'B'] },
                kb: { label: 'Kilobyte (KB)', factor: 1024, aliases: ['kb', 'kilobyte'] },
                mb: { label: 'Megabyte (MB)', factor: 1024 * 1024, aliases: ['mb', 'megabyte'] },
                gb: { label: 'Gigabyte (GB)', factor: 1024 * 1024 * 1024, aliases: ['gb', 'gigabyte'] },
                tb: { label: 'Terabyte (TB)', factor: 1024 * 1024 * 1024 * 1024, aliases: ['tb', 'terabyte'] }
            }
        },
        angle: {
            name: 'Angle',
            base: 'deg',
            units: {
                deg: { label: 'Degree (°)', factor: 1, aliases: ['deg', 'degree', 'degrees', '°'] },
                rad: { label: 'Radian (rad)', factor: 180 / Math.PI, aliases: ['rad', 'radian', 'radians'] },
                grad: { label: 'Gradian (grad)', factor: 0.9, aliases: ['grad', 'gradians'] }
            }
        }
    };

    /**
     * Convert value between units in given category
     */
    static convert(value, fromUnitKey, toUnitKey, categoryKey) {
        if (value === '' || isNaN(value)) return null;
        const val = parseFloat(value);
        const cat = this.categories[categoryKey];
        if (!cat) throw new Error(`Unknown category '${categoryKey}'`);

        const fromUnit = cat.units[fromUnitKey];
        const toUnit = cat.units[toUnitKey];
        if (!fromUnit || !toUnit) throw new Error(`Invalid unit keys`);

        if (categoryKey === 'temperature') {
            return this.convertTemperature(val, fromUnitKey, toUnitKey);
        }

        // Standard multiplicative factor conversion via base unit
        const inBase = val * fromUnit.factor;
        const result = inBase / toUnit.factor;
        return result;
    }

    static convertTemperature(value, from, to) {
        let c;
        if (from === 'c') c = value;
        else if (from === 'f') c = (value - 32) * (5 / 9);
        else if (from === 'k') c = value - 273.15;

        if (to === 'c') return c;
        if (to === 'f') return (c * (9 / 5)) + 32;
        if (to === 'k') return c + 273.15;
        return c;
    }

    /**
     * Match natural language queries like: "10 km to miles", "25 C in F", "100 MB to GB"
     */
    static parseNaturalLanguage(query) {
        if (!query || typeof query !== 'string') return null;
        const pattern = /^([\d.]+)\s*([a-zA-Z°"'/]+)\s+(?:to|in|into)\s+([a-zA-Z°"'/]+)$/i;
        const match = query.trim().match(pattern);
        if (!match) return null;

        const val = parseFloat(match[1]);
        const fromStr = match[2].toLowerCase();
        const toStr = match[3].toLowerCase();

        // Find unit across all categories
        for (const [catKey, cat] of Object.entries(this.categories)) {
            let foundFrom = null;
            let foundTo = null;

            for (const [uKey, u] of Object.entries(cat.units)) {
                if (uKey.toLowerCase() === fromStr || u.aliases.includes(fromStr)) {
                    foundFrom = uKey;
                }
                if (uKey.toLowerCase() === toStr || u.aliases.includes(toStr)) {
                    foundTo = uKey;
                }
            }

            if (foundFrom && foundTo) {
                const converted = this.convert(val, foundFrom, foundTo, catKey);
                return {
                    success: true,
                    category: catKey,
                    categoryName: cat.name,
                    value: val,
                    fromUnit: cat.units[foundFrom].label,
                    toUnit: cat.units[foundTo].label,
                    result: converted,
                    display: `${val} ${foundFrom} = ${parseFloat(converted.toFixed(6))} ${foundTo}`
                };
            }
        }

        return null;
    }
}
