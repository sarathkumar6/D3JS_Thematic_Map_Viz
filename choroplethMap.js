const getCountInfo = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json',
      getEducationInfo = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';

d3.json(getCountInfo, (dataset) => {
  const us_county_data = dataset;
  
  d3.json(getEducationInfo, (error, dataset) => {
    const us_education_data = dataset;
    
    // Width and Height of the whole visualization
    let width = 960;
    let height = 600;

    // Create SVG
    let svg = d3.select( "#map" )
      .append( "svg" )
      .attr( "width", width )
      .attr( "height", height );
    
    const tooltip = d3.select("#map")
      .append("div")
      .attr("id", "tooltip");
    
    let min = d3.min(us_education_data, (d) => d.bachelorsOrHigher);
    let max = d3.max(us_education_data, (d) => d.bachelorsOrHigher);
    
    var x = d3.scaleLinear()
      .domain([min, max])
      .rangeRound([600, 860]);
    
    let color = d3.scaleThreshold()
      .domain(d3.range(min, max, (max-min)/8))
      .range(d3.schemeGreens[9]);
    
    let legend = svg.append( "g" )
      .attr("class", "key")
      .attr("id", "legend")
      .attr("transform", "translate(0,40)");
    
    legend.selectAll("rect")
      .data(color.range().map((d) => {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
       }))
      .enter()
      .append("rect")
      .attr("height", 10)
      .attr("x", (d) => x(d[0]))
      .attr("width", (d) => x(d[1]) - x(d[0]) )
      .attr("fill", (d) => color(d[0]) );
    
    let x_axis = d3.axisBottom(x)
      .tickSize(13)
      .tickFormat((x) => Math.round(x) + '%')
      .tickValues(color.domain());
    
    legend.call(x_axis)
      .select(".domain")
      .remove();

    // Append empty placeholder g element to the SVG
    // g will contain geometry elements
    let us_county = svg.append( "g" );
    
    // Create GeoPath function that uses built-in D3 functionality to turn
    let geoPath = d3.geoPath();
    
    us_county.selectAll( "path" )
      .data( topojson.feature(us_county_data, us_county_data.objects.counties).features )
      .enter()
      .append( "path" )
      .attr("class", "county")
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => {
        let result = us_education_data.filter(( obj ) => obj.fips == d.id);
        return result[0] ? result[0].bachelorsOrHigher : 0;
       })
      .attr( "stroke", "#333")
      .attr( "d", geoPath )
      .attr("fill", (d) => { 
        const = us_education_data.filter(( obj ) => obj.fips == d.id);
        return result[0] ? color(result[0].bachelorsOrHigher) : color(0);
       })
    
      .on("mouseover", (d) =>   tooltip.style("visibility", "visible")
          .attr("data-education", () => {
            const result = us_education_data.filter(( obj ) => obj.fips == d.id);
            return result[0] ? result[0].bachelorsOrHigher : 0;
           })
          .html(() => {
            const result = us_education_data.filter(( obj ) => obj.fips == d.id);
            return result[0] ? result[0].area_name + ', ' + result[0].state + ': ' + result[0].bachelorsOrHigher : 'none';
           })
       )
      .on("mousemove", (d) => tooltip.style("top", (d3.event.pageY-0)+"px")
          .attr("data-education", () => {
            const result = us_education_data.filter(( obj ) => obj.fips == d.id);
            return result[0] ? result[0].bachelorsOrHigher : 0;
           })
          .style("left", (d3.event.pageX+20)+"px")
       )
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

  });
  
});