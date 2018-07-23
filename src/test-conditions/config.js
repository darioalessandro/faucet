const BIT_RATES_KBITS = [100,100,1000];
const LATENCIES = [20, 200, 2000, 10000];

const TestConditions = [];

for (let up in BIT_RATES_KBITS) {
    for (let down in BIT_RATES_KBITS) {
        for (let rtt in LATENCIES) {
            TestConditions.push({
                up:BIT_RATES_KBITS[up],
                down:BIT_RATES_KBITS[down],
                rtt:LATENCIES[rtt],
            })
        }
    }
}

module.exports = { TestConditions };