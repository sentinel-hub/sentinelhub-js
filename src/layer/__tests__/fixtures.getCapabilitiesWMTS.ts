export const getCapabilitiesWmtsXMLResponse = `<Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.0.0" xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd">
<ows:ServiceIdentification>
<ows:Title>Entire Catalog</ows:Title>
<ows:ServiceType>OGC WMTS</ows:ServiceType>
<ows:ServiceTypeVersion>1.0.0</ows:ServiceTypeVersion>
</ows:ServiceIdentification>
<ows:ServiceProvider>
<ows:ProviderName>Planet Basemaps Tile Service</ows:ProviderName>
<ows:ProviderSite xlink:href="https://developers.planet.com/docs/api/tile-services/"/>
<ows:ServiceContact>
<ows:IndividualName>support@planet.com</ows:IndividualName>
</ows:ServiceContact>
</ows:ServiceProvider>
<ows:OperationsMetadata>
<ows:Operation name="GetCapabilities">
<ows:DCP>
<ows:HTTP>
<ows:Get xlink:href="https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=<api_key>">
<ows:Constraint name="GetEncoding">
<ows:AllowedValues>
<ows:Value>RESTful</ows:Value>
</ows:AllowedValues>
</ows:Constraint>
</ows:Get>
</ows:HTTP>
</ows:DCP>
</ows:Operation>
<ows:Operation name="GetTile">
<ows:DCP>
<ows:HTTP>
<ows:Get xlink:href="https://tiles.planet.com/basemaps/v1/planet-tiles">
<ows:Constraint name="GetEncoding">
<ows:AllowedValues>
<ows:Value>RESTful</ows:Value>
</ows:AllowedValues>
</ows:Constraint>
</ows:Get>
</ows:HTTP>
</ows:DCP>
</ows:Operation>
</ows:OperationsMetadata>
<Contents>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2015-12 2016-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2015-12 2016-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2015-12_2016-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2015-12_2016-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2016-06 2016-11 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2016-06 2016-11 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2016-06_2016-11_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2016-06_2016-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2016-12 2017-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2016-12 2017-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2016-12_2017-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2016-12_2017-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2017-06 2017-11 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2017-06 2017-11 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2017-06_2017-11_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2017-06_2017-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2017-12 2018-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2017-12 2018-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2017-12_2018-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2017-12_2018-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2018-06 2018-11 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2018-06 2018-11 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2018-06_2018-11_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2018-06_2018-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2018-12 2019-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2018-12 2019-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2018-12_2019-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2018-12_2019-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2019-06 2019-11 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2019-06 2019-11 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2019-06_2019-11_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2019-06_2019-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2019-12 2020-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2019-12 2020-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2019-12_2020-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2019-12_2020-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2020-06 2020-08 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2020-06 2020-08 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2020-06_2020-08_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2020-06_2020-08_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2020-09 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2020-09 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2020-09_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2020-09_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2020-10 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2020-10 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2020-10_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2020-10_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2020-11 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2020-11 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2020-11_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2020-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2020-12 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2020-12 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2020-12_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2020-12_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2021-01 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2021-01 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2021-01_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2021-01_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2021-02 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2021-02 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2021-02_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2021-02_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2021-03 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2021-03 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2021-03_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2021-03_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2021-04 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2021-04 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2021-04_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2021-04_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2021-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2021-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2021-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2021-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2021-06 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2021-06 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2021-06_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2021-06_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2021-07 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2021-07 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2021-07_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2021-07_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2021-08 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2021-08 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2021-08_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2021-08_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2021-09 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2021-09 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2021-09_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2021-09_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Normalized Analytic 2021-10 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Normalized Analytic 2021-10 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_normalized_analytic_2021-10_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_normalized_analytic_2021-10_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2015-12 2016-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2015-12 2016-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2015-12_2016-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2015-12_2016-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2016-06 2016-11 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2016-06 2016-11 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2016-06_2016-11_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2016-06_2016-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2016-12 2017-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2016-12 2017-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2016-12_2017-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2016-12_2017-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2017-06 2017-11 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2017-06 2017-11 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2017-06_2017-11_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2017-06_2017-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2017-12 2018-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2017-12 2018-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2017-12_2018-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2017-12_2018-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2018-06 2018-11 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2018-06 2018-11 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2018-06_2018-11_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2018-06_2018-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2018-12 2019-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2018-12 2019-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2018-12_2019-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2018-12_2019-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2019-06 2019-11 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2019-06 2019-11 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2019-06_2019-11_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2019-06_2019-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2019-12 2020-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2019-12 2020-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2019-12_2020-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2019-12_2020-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2020-06 2020-08 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2020-06 2020-08 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2020-06_2020-08_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2020-06_2020-08_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2020-09 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2020-09 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2020-09_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2020-09_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2020-10 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2020-10 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2020-10_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2020-10_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2020-11 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2020-11 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2020-11_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2020-11_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2020-12 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2020-12 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2020-12_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2020-12_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2021-01 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2021-01 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2021-01_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2021-01_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2021-02 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2021-02 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2021-02_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2021-02_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2021-03 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2021-03 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2021-03_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2021-03_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2021-04 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2021-04 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2021-04_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2021-04_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2021-05 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2021-05 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2021-05_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2021-05_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2021-06 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2021-06 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2021-06_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2021-06_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2021-07 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2021-07 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2021-07_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2021-07_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2021-08 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2021-08 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2021-08_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2021-08_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2021-09 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2021-09 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2021-09_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2021-09_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Planet Medres Visual 2021-10 Mosaic</ows:Title>
<ows:Abstract>Planet Medres Visual 2021-10 Mosaic</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>planet_medres_visual_2021-10_mosaic</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/planet-tiles/planet_medres_visual_2021-10_mosaic/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Latest PS Tropical Normalized Analytic Biannual Archive</ows:Title>
<ows:Abstract>Latest PS Tropical Normalized Analytic Biannual Archive</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>Latest PS Tropical Normalized Analytic Biannual Archive</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/latest-series/1725ab80-8e12-4b3c-9c25-99550eb466e4/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Latest PS Tropical Normalized Analytic Monthly Monitoring</ows:Title>
<ows:Abstract>Latest PS Tropical Normalized Analytic Monthly Monitoring</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>Latest PS Tropical Normalized Analytic Monthly Monitoring</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/latest-series/be1f8e5e-6a29-4d27-8542-1fdb664fd78e/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Latest PS Tropical Visual Biannual Archive</ows:Title>
<ows:Abstract>Latest PS Tropical Visual Biannual Archive</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>Latest PS Tropical Visual Biannual Archive</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/latest-series/b55b46db-40cc-4432-b4dd-705ac40b2a16/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<Layer>
<ows:Title>Latest PS Tropical Visual Monthly Monitoring</ows:Title>
<ows:Abstract>Latest PS Tropical Visual Monthly Monitoring</ows:Abstract>
<ows:WGS84BoundingBox crs="urn:ogc:def:crs:OGC:2:84">
<ows:LowerCorner>-179.900000 -30.009514</ows:LowerCorner>
<ows:UpperCorner>179.900000 30.102505</ows:UpperCorner>
</ows:WGS84BoundingBox>
<ows:Identifier>Latest PS Tropical Visual Monthly Monitoring</ows:Identifier>
<Style isDefault="true">
<ows:Identifier>Default</ows:Identifier>
</Style>
<Format>image/png</Format>
<TileMatrixSetLink>
<TileMatrixSet>GoogleMapsCompatible15</TileMatrixSet>
</TileMatrixSetLink>
<ResourceURL format="image/png" resourceType="tile" template="https://tiles.planet.com/basemaps/v1/latest-series/45d01564-c099-42d8-b8f2-a0851accf3e7/gmap/{TileMatrix}/{TileCol}/{TileRow}.png?api_key=<api_key>"/>
</Layer>
<TileMatrixSet>
<ows:Identifier>GoogleMapsCompatible15</ows:Identifier>
<ows:SupportedCRS>urn:ogc:def:crs:EPSG::3857</ows:SupportedCRS>
<TileMatrix>
<ows:Identifier>0</ows:Identifier>
<ScaleDenominator>559082264.028718</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>1</MatrixWidth>
<MatrixHeight>1</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>1</ows:Identifier>
<ScaleDenominator>279541132.014359</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>2</MatrixWidth>
<MatrixHeight>2</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>2</ows:Identifier>
<ScaleDenominator>139770566.007179</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>4</MatrixWidth>
<MatrixHeight>4</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>3</ows:Identifier>
<ScaleDenominator>69885283.003590</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>8</MatrixWidth>
<MatrixHeight>8</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>4</ows:Identifier>
<ScaleDenominator>34942641.501795</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>16</MatrixWidth>
<MatrixHeight>16</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>5</ows:Identifier>
<ScaleDenominator>17471320.750897</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>32</MatrixWidth>
<MatrixHeight>32</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>6</ows:Identifier>
<ScaleDenominator>8735660.375449</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>64</MatrixWidth>
<MatrixHeight>64</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>7</ows:Identifier>
<ScaleDenominator>4367830.187724</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>128</MatrixWidth>
<MatrixHeight>128</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>8</ows:Identifier>
<ScaleDenominator>2183915.093862</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>256</MatrixWidth>
<MatrixHeight>256</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>9</ows:Identifier>
<ScaleDenominator>1091957.546931</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>512</MatrixWidth>
<MatrixHeight>512</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>10</ows:Identifier>
<ScaleDenominator>545978.773466</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>1024</MatrixWidth>
<MatrixHeight>1024</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>11</ows:Identifier>
<ScaleDenominator>272989.386733</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>2048</MatrixWidth>
<MatrixHeight>2048</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>12</ows:Identifier>
<ScaleDenominator>136494.693366</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>4096</MatrixWidth>
<MatrixHeight>4096</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>13</ows:Identifier>
<ScaleDenominator>68247.346683</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>8192</MatrixWidth>
<MatrixHeight>8192</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>14</ows:Identifier>
<ScaleDenominator>34123.673342</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>16384</MatrixWidth>
<MatrixHeight>16384</MatrixHeight>
</TileMatrix>
<TileMatrix>
<ows:Identifier>15</ows:Identifier>
<ScaleDenominator>17061.836671</ScaleDenominator>
<TopLeftCorner>-20037508.34278925 20037508.34278925</TopLeftCorner>
<TileWidth>256</TileWidth>
<TileHeight>256</TileHeight>
<MatrixWidth>32768</MatrixWidth>
<MatrixHeight>32768</MatrixHeight>
</TileMatrix>
</TileMatrixSet>
</Contents>
<ServiceMetadataURL xlink:href="https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=<api_key>"/>
</Capabilities>`;
