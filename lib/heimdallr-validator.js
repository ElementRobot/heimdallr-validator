/** @module heimdallr-validator */
var debug = require('debug')('validator'),
    chai = require('chai'),
    chaiJSONSchema = require('chai-json-schema');

chai.use(chaiJSONSchema);

var assert = chai.assert,
    defaultSchemas = {
        'event': {
            'title': 'Heimdallr event packet',
            'type': 'object',
            'properties': {
                'subtype': {'type': 'string'},
                'data': {},
                't': {'type': 'string'}
            },
            'required': ['subtype', 'data', 't'],
            'additionalProperties': false
        },
        'sensor': {
            'title': 'Heimdallr sensor packet',
            'type': 'object',
            'properties': {
                'subtype': {'type': 'string'},
                'data': {},
                't': {'type': 'string'}
            },
            'required': ['subtype', 'data', 't'],
            'additionalProperties': false
        },
        'control': {
            'title': 'Heimdallr control packet',
            'type': 'object',
            'properties': {
                'subtype': {'type': 'string'},
                'data': {},
                'provider': {'type': 'string'},
                'persistent': {'type': 'boolean'}
            },
            'required': ['subtype', 'data', 'provider'],
            'additionalProperties': false
        }
    };

/**
 * Verifies that the input string follows the RFC 4122 v4 UUID standard.
 *
 * @param {string} uuid - The UUID to validate.
 * @return {boolean} - True if <tt>uuid</tt> is a valid v4 UUID.
 */ 
function validUUID(uuid){
    // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x is a hexadecimal digit and
    // y is 8,9, A, or B
    var uuidRegex = /^[0-9a-f]{8}\-[0-9a-f]{4}\-4[0-9a-f]{3}\-[89ab][0-9a-f]{3}\-[0-9a-f]{12}$/i;

    result = uuidRegex.exec(uuid);

    return result !== null;
}

/**
 * Verifies that the input string follows the ISO 8601 standard.
 *
 * @param {string} timestamp - The timestamp to validate.
 * @return {boolean} - True if <tt>timestamp</tt> is a valid ISO 8601 string.
 */
function validTimestamp(timestamp){
    // ^year-month-day(Thour:min:secms?timezone)?$
    var year = /((?:[1-9][0-9]*)?[0-9]{4})/,
        month = /(1[0-2]|0[1-9])/,
        day = /(3[01]|0[1-9]|[12][0-9])/,
        hour = /(2[0-3]|[01][0-9])/,
        minute = /([0-5][0-9])/,
        second = /([0-5][0-9])/,
        ms = /(\.[0-9]+)/,
        timezone = /(Z|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])/,
        date = [year.source, month.source, day.source].join('-'),
        time = [hour.source, minute.source, second.source].join(':'),
        timestampRegex,
        result;

    timestampRegex = new RegExp(
        '^' + date + '(T' + time + ms.source + '?' + timezone.source + ')?$'
    );

    result = timestampRegex.exec(timestamp);

    return result !== null;
}

module.exports = {
    /**
     * Verifies that the packet conforms to the correct structure for the
     * given type. Raises an AssertionError if the packet violates the schema
     * for the type or if there is a provider field and it is not a valid UUID
     * or if there is a t field and it is not a valid ISO 8601 timestamp.
     *
     * @param {string} type - The type of Heimdallr packet. Must be
     *     'event', 'sensor', or 'control'.
     * @param {object} packet - The packet to validate.
     */
    validatePacket: function validatePacket(type, packet){
        debug('Type:', type);
        debug('Packet:', packet);
        assert.jsonSchema(packet, defaultSchemas[type]);

        if(packet.hasOwnProperty('provider')){
            assert(
                validUUID(packet.provider), '`provider` must be a valid UUID'
            );
        }

        if(packet.hasOwnProperty('t')){
            assert(
                validTimestamp(packet.t), '`t` must ba an ISO 8601 timestamp'
            );
        }
    },

    /**
     * Verifies that the data conforms to the schema. Raises an AssertionError
     * if the data violates the schema.
     * 
     * @param {} data - The data to validate.
     * @param {object} schema - Valid JSON schema.
     */
    validateData: function validateData(data, schema){
        debug('Data:', data);
        debug('Schema:', schema);
        assert.jsonSchema(data, schema);
    }
};
