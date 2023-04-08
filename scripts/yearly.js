const events = await d3.csv('../data/yearly.csv')

events.forEach(item => {
    item.week = parseInt(item.week)
    item.day = parseInt(item.day)
    item.count = parseInt(item.count)
})

let count = new Array(10).fill(0).map(() => new Array(8).fill(0));
for (i of events) {
    count[i.week][i.day]++
}

const SVG = d3.select("#svg_three")
const Width = 1000
const Height = 600
const Margin = { top: 20, bottom: 0, left: 20, right: 20 }
const innerWidth = Width - Margin.left - Margin.right
const innerHeight = Height - Margin.top - Margin.top

const days = ['WEEK', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const color = { Quiz: "#4A235A", Event: "#1B4F72", Holiday: "#0E6251" }

const xscale = d3.scaleLinear()
    .domain([0, 8])
    .range([0, innerWidth])

const yscale = d3.scaleLinear()
    .domain([0, 10])
    .range([innerHeight, Margin.top])

const bottom = d3.axisBottom(xscale).tickSizeInner(0).tickSizeOuter(0).tickFormat("");
const left = d3.axisLeft(yscale).tickSizeInner(0).tickSizeOuter(0).tickFormat("");
const upper = d3.axisTop(xscale).tickSizeInner(0).tickSizeOuter(0).tickFormat("");
const right = d3.axisRight(yscale).tickSizeInner(0).tickSizeOuter(0).tickFormat("");

const xAxisGrid = d3.axisBottom(xscale).tickSize(-innerHeight + Margin.top).tickFormat('').ticks(8);
const yAxisGrid = d3.axisLeft(yscale).tickSize(-innerWidth).tickFormat('').ticks(10);

SVG.append("g")
    .attr("transform", `translate(20, ${innerHeight})`)
    .call(bottom)

SVG.append("g")
    .attr("transform", `translate(${Margin.left}, ${Margin.top})`)
    .call(upper)

SVG.append("g")
    .attr("transform", `translate(${Margin.left}, 0)`)
    .call(left)

SVG.append("g")
    .attr("transform", `translate(${innerWidth + Margin.left}, 0)`)
    .call(right)

SVG.append("g")
    .attr("transform", `translate(20, ${innerHeight})`)
    .call(xAxisGrid)

SVG.append("g")
    .attr("transform", `translate(${Margin.left}, 0)`)
    .call(yAxisGrid)

for (var i = 0; i < 8; i++) {
    let val = xscale(i + 0.5) + Margin.left
    let y = yscale(9) - Margin.top

    SVG.append("text")
        .text(days[i])
        .attr("transform", `translate(${val}, ${y})`)
        .style("text-anchor", "middle")
        .attr("font-weight", 900)
        .style("font-size", 14)
}

for (var i = 0; i < 9; i++) {
    let val = yscale(i) - Margin.top - 3
    let x = xscale(0.5) + Margin.left

    SVG.append("text")
        .text("WEEK " + (9 - i))
        .attr("transform", `translate(${x}, ${val})`)
        .style("text-anchor", "middle")
        .attr("font-weight", 500)
        .style("font-size", 12)
}

let cnt = 0

for (i of events) {
    let maxwidth = 116
    let maxheight = 50
    let x = xscale(i.day + 0.5) + Margin.left - (maxwidth / 2) + 0.5
    let y = yscale(9 - i.week) - Margin.top - (maxheight / 2) - 6.5
    let type = i.name

    if (count[i.week][i.day] > 1) {
        if (cnt == 0) {
            cnt = count[i.week][i.day]
        }
        cnt--
        y = yscale(9 - i.week) - Margin.top - (maxheight / 2) - 6.5 + ((maxheight / count[i.week][i.day]) * cnt)
    }
    else {
        cnt = count[i.week][i.day]
    }

    let Block = SVG.append("g")
        .on("mouseover", function (d) {
            d3.select(this).select('rect').style("opacity", 1);
            d3.select(this).select('text').style("fill", "white").style("font-weight", 900).style("font-size", 12)
        })
        .on("mouseout", function (d) {
            d3.select(this).select('rect').style("opacity", 0.7);
            d3.select(this).select('text').style("fill", "black").style("font-weight", 400).style("font-size", 11)
        })
        .attr("id", "yearly" + i.count)

    $('#yearly' + i.count).qtip({
        content: i.description,
        position: {
            my: 'bottom left',
            at: 'right center',
            target: 'mouse'
        },
        style: {
            classes: 'qtip-dark'
        }
    });

    Block.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr("width", maxwidth)
        .attr("height", maxheight / count[i.week][i.day])
        .style("fill", color[type])
        .attr("opacity", 0.7)

    Block.append("text")
        .text(i.name)
        .attr("transform", `translate(${x + maxwidth / 2}, ${y + (maxheight / (2 * count[i.week][i.day])) + 3})`)
        .style("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", 11)
        .style("font-weight", 400)
}