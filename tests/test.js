var Mocha = require('mocha'),
    assert = require('chai').assert,
    validator = require('../index.js'),
    ts = (new Date()).toISOString(),
    validUUID = 'f52b68f5-4f96-4be2-bf6b-3c78fd29c76d',
    testPackets = {
        'event': {'subtype': 'test', 'data': true, 't': ts},
        'sensor': {'subtype': 'test', 'data': true, 't': ts},
        'control': {
            'provider': validUUID,
            'subtype': 'test',
            'data': true
        }
    };


describe('Heimdallr Validator', function(){
    it('handles valid Heimdallr packet', function(done){
        for(var packetType in testPackets){
            validator.validatePacket(packetType, testPackets[packetType]);
        }
        done();
    });

    it('handles invalid Heimdallr packet', function(done){
        var errorCount = 0;
        for(var packetType in testPackets){
            try{
                validator.validatePacket(packetType, {});
            }
            catch(error){
                errorCount++;
                assert(
                    error.expected === 'Heimdallr ' + packetType + ' packet',
                    error
                );
            }
        }
        assert(
            errorCount === Object.keys(testPackets).length,
            'incorrect error count'
        );
        done();
    });

    it('handles valid data', function(done){
        validator.validateData(
            'test', {'title': 'test packet', 'type': 'string'}
        );
        done();
    });

    it('handles invalid data', function(done){
        var errorCount = 0;
        try{
            validator.validateData(
                'test', {'title': 'test packet', 'type': 'boolean'}
            );
        }
        catch(error){
            errorCount++;
            assert(error.expected === 'test packet', error);
        }
        assert(errorCount === 1, 'incorrect error count');
        done();
    });

    it('handles invalid UUID', function(done){
        // xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx where x is a hexadecimal
        // digit and y is 8,9, A, or B
        var errorCount = 0,
            invalidUUIDs = [
                '52b68f5-8f96-4be2-bf6b-3c78fd29c76d', // wrong length
                'g52b68f5-8f96-4be2-bf6b-3c78fd29c76d', // non hex digit
                'f52b68f5-8f96-3be2-bf6b-3c78fd29c76d', // v4
                'f52b68f5-8f96-4be2-1f6b-3c78fd29c76d' // incorrect y
            ];

        for(var i = 0; i < invalidUUIDs.length; i++){
            try{
                validator.validatePacket(
                    'control',
                    {
                        'provider': invalidUUIDs[i],
                        'subtype': 'test',
                        'data': true
                    }
                );
            }
            catch(error){
                errorCount++;
                assert(
                    error.message === '`provider` must be a valid UUID',
                    'incorrect error message'
                );
            }
        }
        assert(errorCount === invalidUUIDs.length, 'incorrect error count');
        done();
    });

    it('handles invalid timestamp', function(done){
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
            ];

        for(var i = 0; i < invalidTimestamps.length; i++){
            try{
                validator.validatePacket(
                    'event',
                    {
                        'subtype': 'test',
                        'data': true,
                        't': invalidTimestamps[i]
                    }
                );
            }
            catch(error){
                errorCount++;
                assert(
                    error.message === '`t` must ba an ISO 8601 timestamp',
                    'incorrect error message'
                );
            }
        }
        assert(errorCount === invalidTimestamps.length, 'incorrect error count');
        done();
    });

});


