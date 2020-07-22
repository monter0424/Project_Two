let data;

const changeTable = (e) => {
  if (e === 0) {
    $('.first-table').removeClass('hide')
    $('.second-table').addClass('hide')
    $('.third-table').addClass('hide')
  }
  if (e === 1) {
    $('.second-table').removeClass('hide')
    $('.first-table').addClass('hide')
    $('.third-table').addClass('hide')
  }
  if (e === 2) {
    $('.third-table').removeClass('hide')
    $('.second-table').addClass('hide')
    $('.first-table').addClass('hide')
  }
}

const init = () => {
  changeTable(0)
  var s = new Set() // js set [],
  d3.csv('assets/data/vgsales.csv').then(function (res) {
    res.map(e => s.add(e.Platform))
    const mergeData = [];
    [...s].map(e => {
      let a = []
      res.map(ele => {
        if (ele.Platform === e) {
          a.push(ele)
        }
      })

      let NA = 0;
      let EU = 0;
      let JP = 0;
      let Rest = 0;
      let Global = 0;
      a.forEach((e) => {
        NA += +e.NA_Sales * 100;
        EU += +e.EU_Sales * 100;
        JP += +e.JP_Sales * 100;
        Rest += +e.Other_Sales * 100;
        Global += +e.Global_Sales * 100;
      });
      mergeData.push({
        Platform: e,
        NA_Sales: NA / 100,
        EU_Sales: EU / 100,
        JP_Sales: JP / 100,
        Other_Sales: Rest / 100,
        Global_Sales: Global / 100
      })
    })

    data = mergeData
    drawFirst(mergeData)
    drawSecond(mergeData)
    dealThirdData(res, [...s])
  });
}

init()

//first
var firstSortType = false;

const drawFirst = function (res) {
  if (!res) res = data
  let html = `<table><thead><tr><th>Pos</th><th>Platform</th><th>North America</th><th>Europe</th><th>Japan</th><th>Rest of World</th><th onclick="drawFirst()">Global${firstSortType ? '<span class="arrow dsc"></span>' : '<span class="arrow asc"></span>'}</th></tr></thead><tbody>`
  res.sort((a, b) =>
    firstSortType ? a.Global_Sales - b.Global_Sales : b.Global_Sales - a.Global_Sales
  );
  res.map((e, index) => {
    html += `<tr><td>${index + 1}</td><td>${e.Platform}</td><td>${e.NA_Sales}</td><td>${e.EU_Sales}</td><td>${e.JP_Sales}</td><td>${e.Other_Sales}</td><td>${e.Global_Sales}</td></tr>`
  })
  html += '</tbody></table>'
  firstSortType = !firstSortType
  $('.first-table-content').html(html)
}

// second
const drawSecond = (res) => {
  let html = '<label for="cars">Choose a Platform:</label><select name="cars" onchange="drawPie(this.value)">'
  if (!res) res = data
  res.map(e => {
    html += `<option value="${e.Platform}">${e.Platform}</option>`
  })
  html += '</select> global sales'
  $('.platform-select').html(html)
  drawPie()
}

const drawPie = (res) => {
  let dataset
  
  $('.second-table-content').html('')
  
  if (res) {
    let datas = data.filter(e => e.Platform === res)
    console.log(datas);
    dataset = [['Rest of World', datas[0].Other_Sales], ['Japan', datas[0].JP_Sales], ['Europe', datas[0].EU_Sales], ['North America', datas[0].NA_Sales]];
  } else {
    dataset = [['Rest of World', data[0].Other_Sales], ['Japan', data[0].JP_Sales], ['Europe', data[0].EU_Sales], ['North America', data[0].NA_Sales]];
  };
  
  var width = 800;
  var height = 600;
  var pie = d3.pie()
    .sort(null)
    .value(function (d) {
      return d[1];
    });
  var piedata = pie(dataset);

  var outerRadius = width / 4;
  var innerRadius = 0;

  var arc = d3.arc()
    .outerRadius(outerRadius)
    .innerRadius(innerRadius);

  var colors = d3.schemeCategory10;

  var svg = d3.select('.second-table-content')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  var arcs = svg.selectAll('g')
    .data(piedata)
    .enter()
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  arcs.append('path')
    .attr('fill', function (d, i) {
      return colors[i];
    })
    .attr('d', function (d) {
      return arc(d);
    });

  arcs.append('text')
    .attr('transform', function (d, i) {
      var x = arc.centroid(d)[0] * 2.8;
      var y = arc.centroid(d)[1] * 2.8;
      if (i === 4) {
        return 'translate(' + (x * 1.2) + ', ' + (y * 1.2) + ')';
      } else if (i === 3) {
        return 'translate(' + (x - 40) + ', ' + y + ')';
      } else if (i === 5) {
        return 'translate(' + (x + 40) + ', ' + y + ')';
      }
      return 'translate(' + x + ', ' + y + ')';
    })
    .attr('text-anchor', 'middle')
    .text(function (d) {
      var percent = Number(d.value) / d3.sum(dataset, function (d) {
        return d[1];
      }) * 100;
      return d.data[0] + ' ' + percent.toFixed(1) + '%';
    })

  arcs.append('line')
    .attr('stroke', 'black')
    .attr('x1', function (d) { return arc.centroid(d)[0] * 2; })
    .attr('y1', function (d) { return arc.centroid(d)[1] * 2; })
    .attr('x2', function (d, i) {
      if (i === 4) {
        return arc.centroid(d)[0] * 3.2;
      }
      return arc.centroid(d)[0] * 2.5;
    })
    .attr('y2', function (d, i) {
      if (i === 4) {
        return arc.centroid(d)[1] * 3.2;
      }
      return arc.centroid(d)[1] * 2.5;
    });
}

// third
let thirdSortType = false
let thirdData = []

const dealThirdData = (res, platforms) => {
  console.log(platforms);
  res = res.filter(e => e.Year !== 'N/A')
  platforms.map(e => {
    thirdData.push({
      Platform: e,
      data: res.filter(ele => ele.Platform === e)
    })
  })

  let html = '<label for="cars">Platform:</label><select name="cars" onchange="drawThird(this.value)">'
  thirdData.map(e => {
    html += `<option value="${e.Platform}">${e.Platform}</option>`
  })
  html += '</select>'
  $('.third-platform-select').html(html)
  drawThird()
}

const drawThird = (res) => {
  let dataset
  if (res) res = res.toString()

  $('.third-table-content').html('')
  
  if (res && res !== 'undefined') {
    let datas = thirdData.filter(e => e.Platform === res)
    console.log(datas);
    dataset = datas[0].data;
  } else {
    dataset = thirdData[0].data;
  };

  let html = `<table><thead><tr><th>Pos</th><th>Name</th><th>Year</th><th>Genre</th><th>Publisher</th><th onclick="drawThird('${res}')">Global_Sales${thirdSortType ? '<span class="arrow dsc"></span>' : '<span class="arrow asc"></span>'}</th></tr></thead><tbody>`
  dataset.sort((a, b) =>
  thirdSortType ? a.Global_Sales - b.Global_Sales : b.Global_Sales - a.Global_Sales
  );
  dataset.map((e, index) => {
    html += `<tr><td>${index + 1}</td><td>${e.Name}</td><td>${e.Year}</td><td>${e.Genre}</td><td>${e.Publisher}</td><td>${e.Global_Sales}</td></tr>`
  })
  html += '</tbody></table>'
  thirdSortType = !thirdSortType
  $('.third-table-content').html(html)
}