const assert = require('assert');

describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal(-1, [1,2,3].indexOf(4));
        });
    });

    describe('#slice()', function() {
        it('should return 2, 3 after the array slice', function() {
            assert.deepEqual([2,3], [1,2,3].slice(1));
        });
    });
});