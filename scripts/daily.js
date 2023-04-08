let data = await d3.csv('/data/daily.csv', (d) => {
  d.start = new Date(d.start);
  d.end = new Date(d.end);
  d.tasks = JSON.parse(d.tasks.replace(/""/g, '"'));
  d.tasks.forEach(task => {
    task.start = new Date(task.start);
    task.end = new Date(task.end);
  });
  return d;
});

const color_map = {}

function getColor(d) {
  if (color_map[d.class]) {
    return color_map[d.class]
  } else {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    const color = `#${r.toString(16).padStart(2, '0')}` +
      `${g.toString(16).padStart(2, '0')}` +
      `${b.toString(16).padStart(2, '0')}`;
    color_map[d.class] = color
    return color;
  }
}



const elementWidth = 1000;
const elementHeight = 600;

// Define the dimensions of the chart
const margin = { top: 20, right: 30, bottom: 30, left: 40 };
const width = elementWidth - margin.left - margin.right;
const height = elementHeight - margin.top - margin.bottom;

const x = d3.scaleTime().range([0, width]);
const y = d3.scaleBand().range([0, height]);

// const svg = d3
//   .select("#svg_one")
//   .attr("width", width + margin.left + margin.right)
//   .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//   .attr("transform", `translate(${margin.left},${margin.top})`);

const svg = d3
  .select("#svg_one")
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// flatten the subtasks to be able to draw them on separate rows
const flattenedTasks = data.reduce((acc, curr) => {
  acc.push({ class: curr.class, task: "", start: curr.start, end: curr.end, isTask: false, color: null });
  curr.tasks.forEach((task) => {
    acc.push({ class: curr.class, task: task.name, start: task.start, end: task.end, isTask: true });
  });
  return acc;
}, []);

// console.log(flattenedTasks);

// set domain for the scales
y.domain(flattenedTasks.map((d) => (d.class + d.task)));
x.domain([
  d3.min(flattenedTasks, (d) => d.start),
  d3.max(flattenedTasks, (d) => d.end),
]);

// draw x-axis
svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x).ticks(d3.timeHour.every(1)))
  .select(".domain")
  .remove();

// draw y-axis
svg.append("g").call(d3.axisLeft(y).tickSize(0));

const groups = svg
  .selectAll(".group")
  .data(flattenedTasks)
  .enter()
  .append("g")
  .attr("class", "group")
  .attr("transform", (d) => `translate(0, ${y(d.class + d.task)})`);

// draw class/task bars
groups
  .filter((d) => !d.isTask)
  .append("rect")
  .attr("class", "class")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width)
  .attr("height", y.bandwidth())
  .style("fill", (d) => getColor(d))
  .style("opacity", 0.5);

// draw white bars on top of class bars
const whiteBarGap = 4;
groups
  .filter((d) => !d.isTask)
  .append("rect")
  .attr("class", "class-overlay")
  .attr("x", (d) => x(d.start) + whiteBarGap)
  .attr("y", y.bandwidth() / 4)
  .attr("width", (d) => x(d.end) - x(d.start) - 2 * whiteBarGap)
  .attr("height", y.bandwidth() / 2)
  .style("fill", "white");
// draw the subtask bars
groups
  .filter((d) => d.isTask)
  .append("rect")
  .attr("class", "task")
  .attr("x", (d) => x(d.start))
  .attr("y", y.bandwidth() / 4)
  .attr("width", (d) => x(d.end) - x(d.start))
  .attr("height", y.bandwidth() / 2)
  .style("fill", (d) => getColor(d));



