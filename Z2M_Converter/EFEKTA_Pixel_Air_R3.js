const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const constants = require('zigbee-herdsman-converters/lib/constants');
const e = exposes.presets;
const ea = exposes.access;



const tzLocal = {
	co2_config: {
        key: ['auto_brightness', 'night_onoff_backlight', 'night_on_backlight', 'night_off_backlight', 'automatic_scal', 'forced_recalibration', 'factory_reset_co2', 'manual_forced_recalibration', 'contrast'],
        convertSet: async (entity, key, rawValue, meta) => {
            const lookup = {'OFF': 0x00, 'ON': 0x01};
			const endpoint = meta.device.getEndpoint(1);
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                auto_brightness: ['msCO2', {0x0211: {value, type: 0x10}}],
				night_onoff_backlight: ['msCO2', {0x0401: {value, type: 0x10}}],
				night_on_backlight: ['msCO2', {0x0405: {value, type: 0x20}}],
				night_off_backlight: ['msCO2', {0x0406: {value, type: 0x20}}],
                forced_recalibration: ['msCO2', {0x0202: {value, type: 0x10}}],
                factory_reset_co2: ['msCO2', {0x0206: {value, type: 0x10}}],
                manual_forced_recalibration: ['msCO2', {0x0207: {value, type: 0x29}}],
				automatic_scal: ['msCO2', {0x0402: {value, type: 0x10}}],
				contrast: ['msCO2', {0x0445: {value, type: 0x20}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	temperaturef_config: {
        key: ['temperature_offset'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const value = parseFloat(rawValue)*10;
            const payloads = {
                temperature_offset: ['msTemperatureMeasurement', {0x0210: {value, type: 0x29}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	humidity_config: {
        key: ['humidity_offset'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const value = parseInt(rawValue, 10);
            const payloads = {
                humidity_offset: ['msRelativeHumidity', {0x0210: {value, type: 0x29}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	co2_gasstat_config: {
        key: ['high_gas', 'low_gas', 'enable_gas', 'invert_logic_gas'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                high_gas: ['msCO2', {0x0221: {value, type: 0x21}}],
                low_gas: ['msCO2', {0x0222: {value, type: 0x21}}],
				enable_gas: ['msCO2', {0x0220: {value, type: 0x10}}],
				invert_logic_gas: ['msCO2', {0x0225: {value, type: 0x10}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
};





const fzLocal = {
	co2: {
        cluster: 'msCO2',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
			if (msg.data.hasOwnProperty('measuredValue')) {
				return {co2: Math.round(msg.data.measuredValue * 1000000)};
			}
        },
    },
	co2_config: {
        cluster: 'msCO2',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0211)) {
                result.auto_brightness = ['OFF', 'ON'][msg.data[0x0211]];
            }
			if (msg.data.hasOwnProperty(0x0401)) {
                result.night_onoff_backlight = ['OFF', 'ON'][msg.data[0x0401]];
            }
			if (msg.data.hasOwnProperty(0x0405)) {
                result.night_on_backlight = msg.data[0x0405];
            }
			if (msg.data.hasOwnProperty(0x0406)) {
                result.night_off_backlight = msg.data[0x0406];
            }
            if (msg.data.hasOwnProperty(0x0202)) {
                result.forced_recalibration = ['OFF', 'ON'][msg.data[0x0202]];
            }
            if (msg.data.hasOwnProperty(0x0206)) {
                result.factory_reset_co2 = ['OFF', 'ON'][msg.data[0x0206]];
            }
            if (msg.data.hasOwnProperty(0x0207)) {
                result.manual_forced_recalibration = msg.data[0x0207];
            }
			if (msg.data.hasOwnProperty(0x0402)) {
                result.automatic_scal = ['OFF', 'ON'][msg.data[0x0402]];
            }
			if (msg.data.hasOwnProperty(0x0445)) {
                result.contrast = msg.data[0x0445];
            }
            return result;
        },
    },
	temperaturef_config: {
        cluster: 'msTemperatureMeasurement',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0210)) {
                result.temperature_offset = parseFloat(msg.data[0x0210])/10.0;
            }
            return result;
        },
    },
    humidity_config: {
        cluster: 'msRelativeHumidity',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0210)) {
                result.humidity_offset = msg.data[0x0210];
            }
            return result;
        },
    },
	co2_gasstat_config: {
        cluster: 'msCO2',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0221)) {
                result.high_gas = msg.data[0x0221];
            }
			if (msg.data.hasOwnProperty(0x0222)) {
                result.low_gas = msg.data[0x0222];
            }
            if (msg.data.hasOwnProperty(0x0220)) {
                result.enable_gas = ['OFF', 'ON'][msg.data[0x0220]];
            }
			if (msg.data.hasOwnProperty(0x0225)) {
                result.invert_logic_gas = ['OFF', 'ON'][msg.data[0x0225]];
            }
            return result;
        },
    },
};

const definition = {
        zigbeeModel: ['EFEKTA_Pixel_AIR'],
        model: 'EFEKTA_Pixel_AIR',
        vendor: 'Custom devices (DiY)',
        description: '[CO2 Monitor with LCD Display, outdoor temperature and humidity, date and time.](http://efektalab.com/Pixel_AIR)',
        fromZigbee: [fz.temperature, fz.humidity, fz.pressure, fz.illuminance, fzLocal.co2, fzLocal.co2_config,
            fzLocal.temperaturef_config, fzLocal.humidity_config, fzLocal.co2_gasstat_config],
        toZigbee: [tz.factory_reset, tzLocal.co2_config, tzLocal.temperaturef_config, tzLocal.humidity_config, tzLocal.co2_gasstat_config],
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
			const endpoint2 = device.getEndpoint(2);
			await reporting.bind(endpoint, coordinatorEndpoint, [
                'genTime', 'msTemperatureMeasurement', 'msRelativeHumidity', 'msCO2']);
		    await reporting.bind(endpoint2, coordinatorEndpoint, ['msIlluminanceMeasurement', 'msPressureMeasurement']);
			const payload1 = [{attribute: {ID: 0x0000, type: 0x39},
            minimumReportInterval: 20, maximumReportInterval: 300, reportableChange: 0.000001}];
            await endpoint.configureReporting('msCO2', payload1);
			const payload2 = [{attribute: {ID: 0x0000, type: 0x29},
            minimumReportInterval: 20, maximumReportInterval: 300, reportableChange: 10}];
            await endpoint.configureReporting('msTemperatureMeasurement', payload2);
			const payload3 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 20, maximumReportInterval: 300, reportableChange: 10}];
			await endpoint.configureReporting('msRelativeHumidity', payload3);
			const payload4 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 20, maximumReportInterval: 300, reportableChange: 10}];
			await endpoint2.configureReporting('msIlluminanceMeasurement', payload4);
			const payload5 = [{attribute: {ID: 0x0000, type: 0x29},
            minimumReportInterval: 20, maximumReportInterval: 300, reportableChange: 1}];
			await endpoint2.configureReporting('msPressureMeasurement', payload5);
        },
        icon: 'data:image/gif;base64,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',
        exposes: [e.co2(), e.temperature(), e.humidity(), e.illuminance(), e.pressure(),
            exposes.binary('auto_brightness', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Enable or Disable Auto Brightness of the Display'),
			exposes.binary('night_onoff_backlight', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Complete shutdown of the backlight at night mode'),
			exposes.numeric('night_on_backlight', ea.STATE_SET).withUnit('Hr').withDescription('Night mode activation time')
                .withValueMin(0).withValueMax(23),
			exposes.numeric('night_off_backlight', ea.STATE_SET).withUnit('Hr').withDescription('Night mode deactivation time')
                .withValueMin(0).withValueMax(23),
			exposes.numeric('contrast', ea.STATE_SET).withDescription('Display Contrast')
                .withValueMin(0).withValueMax(40),
			exposes.numeric('temperature_offset', ea.STATE_SET).withUnit('°C').withValueStep(0.1).withDescription('Adjust temperature')
                .withValueMin(-50.0).withValueMax(50.0),
            exposes.numeric('humidity_offset', ea.STATE_SET).withUnit('%').withDescription('Adjust humidity')
                .withValueMin(-50).withValueMax(50),
			exposes.binary('forced_recalibration', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Start FRC (Perform Forced Recalibration of the CO2 Sensor)'),
			exposes.binary('factory_reset_co2', ea.STATE_SET, 'ON', 'OFF').withDescription('Factory Reset CO2 sensor'),
            exposes.numeric('manual_forced_recalibration', ea.STATE_SET).withUnit('ppm')
			    .withDescription('Start Manual FRC (Perform Forced Recalibration of the CO2 Sensor)')
                .withValueMin(0).withValueMax(5000),
			exposes.binary('automatic_scal', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Automatic self calibration'),
			exposes.binary('enable_gas', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable CO2 Gas Control'),
			exposes.binary('invert_logic_gas', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable invert logic CO2 Gas Control'),
            exposes.numeric('high_gas', ea.STATE_SET).withUnit('ppm').withDescription('Setting High CO2 Gas Border')
                .withValueMin(400).withValueMax(5000),
            exposes.numeric('low_gas', ea.STATE_SET).withUnit('ppm').withDescription('Setting Low CO2 Gas Border')
                .withValueMin(400).withValueMax(5000)],
};

module.exports = definition;