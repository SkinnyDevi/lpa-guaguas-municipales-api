# LPA Guaguas Municipales API

> An API that tracks buses from the LPA Municipality.

## Purpose

Track the location of buses of the municipality with a 30-second real-time interval.

Uses data from the service at: https://lpgc.es/guaguas/

## Features

- `.onUpdate`: general update channel for all buses
- `.onBusUpdate`: single bus update channel
- `.onBusesUpdate`: custom bus list update channel
- `.startPolling(milli)`: start listening for updates every X seconds (best interval: 30 seconds)
- `.stopPolling`: stop listening for updates
- `.enableDebug`: enable additional debug messages
- `.getBuses`: gets all current `BusMarker` objects

## Acknowledgements

Original tracking service website was passed through Grok 3 (beta) to generate the initial iterations of the code.