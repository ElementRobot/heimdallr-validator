"use strict";

var Mocha = require('mocha'),
    assert = require('chai').assert,
    highland = require('highland'),
    tv4 = require('tv4'),
    validator = require('../index.js');

var ts = (new Date()).toISOString(),
    validUUID = 'f52b68f5-4f96-4be2-bf6b-3c78fd29c76d',
    packetTypes = ['event', 'sensor', 'control'],
    testPackets = {
        event: {subtype: 'test', data: true, 't': ts},
        sensor: {subtype: 'test', data: true, 't': ts},
        control: {
            provider: validUUID,
            subtype: 'test',
            data: true
        }
    };

describe('Heimdallr Validator', function () {
    it('handles valid Heimdallr packet', function (done) {
        var test = highland.wrapCallback(function (packetType, fn) {
                validator.validatePacket(
                    packetType,
                    testPackets[packetType],
                    fn
                );
            });

        highland(packetTypes).map(test).parallel(9)
            .errors(function (err) {
                throw new Error(err);
            }).done(done);
    });

    it('handles invalid Heimdallr packet', function (done) {
        var errorCount = 0,
            test = highland.wrapCallback(function (packetType, fn) {
                validator.validatePacket(packetType, {}, fn);
            });

        highland(packetTypes).map(test).parallel(9)
            .errors(function (err) {
                errorCount++;
                assert(err.name === 'ValidationError', err);

                if (errorCount >= Object.keys(testPackets).length) {
                    done();
                }
            }).each(done);
    });

    it('handles valid data', function (done) {
        validator.validateData(
            'test',
            {title: 'test packet', type: 'string'},
            done
        );
    });

    it('handles invalid data', function (done) {
        validator.validateData(
            'test',
            {title: 'test packet', type: 'boolean'},
            function (err, valid) {
                assert(err.name === 'ValidationError', err);
                done();
            }
        );
    });

    it('handles invalid UUID', function (done) {
        // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x is a hexadecimal
        // digit and y is 8,9, A, or B
        var errorCount = 0,
            invalidUuids = [
                '52b68f5-8f96-4be2-bf6b-3c78fd29c76d', // wrong length
                'g52b68f5-8f96-4be2-bf6b-3c78fd29c76d', // non hex digit
                'f52b68f5-8f96-3be2-bf6b-3c78fd29c76d', // v4
                'f52b68f5-8f96-4be2-1f6b-3c78fd29c76d' // incorrect y
            ],
            test = highland.wrapCallback(function (uuid, fn) {
                validator.validatePacket(
                    'control',
                    {
                        provider: uuid,
                        subtype: 'test',
                        data: true
                    },
                    fn
                );
            });

        highland(invalidUuids).map(test).parallel(9).errors(function (err) {
            errorCount++;
            assert(
                err.message === '`provider` must be a valid UUID',
                'incorrect error message'
            );

            if (errorCount >= invalidUuids.length) {
                done();
            }
        }).each(done);
    });

    it('handles invalid timestamp', function (done) {
        // ^year-month-dayThour:min:secms?timezone?$
        var errorCount = 0,
            invalidTimestamps = [
                '2015-2-28', // Not YYYY-MM-DD
                '2015-02-1',
                '15-02-28',
                '02-28-2015',
                '2-28-15',
                '2015-02-28 12:30', // No T
                '2015-02-28T12:30' // No timezone
            ],
            test = highland.wrapCallback(function (timestamp, fn) {
                validator.validatePacket(
                    'event',
                    {
                        subtype: 'test',
                        data: true,
                        t: timestamp
                    },
                    fn
                );
            });

        highland(invalidTimestamps).map(test).parallel(9).errors(function (err) {
            errorCount++;
            assert(
                err.message === '`t` must ba an ISO 8601 timestamp',
                'incorrect error message'
            );

            if (errorCount >= invalidTimestamps.length) {
                done();
            }
        }).each(done);

    });

});


