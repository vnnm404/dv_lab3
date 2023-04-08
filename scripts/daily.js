const data = [
  {
    class: "Class 1",
    start: new Date(2023, 3, 6, 8),
    end: new Date(2023, 3, 6, 16),
    tasks: [
      { name: "Task 1.1", start: new Date(2023, 3, 6, 8), end: new Date(2023, 3, 6, 10) },
      { name: "Task 1.2", start: new Date(2023, 3, 6, 11), end: new Date(2023, 3, 6, 13) },
      { name: "Task 1.3", start: new Date(2023, 3, 6, 14), end: new Date(2023, 3, 6, 16) }
    ]
  },
  {
    class: "Class 2",
    start: new Date(2023, 3, 6, 9),
    end: new Date(2023, 3, 6, 17),

    tasks: [
      { name: "Task 2.1", start: new Date(2023, 3, 6, 9), end: new Date(2023, 3, 6, 11) },
      { name: "Task 2.2", start: new Date(2023, 3, 6, 12), end: new Date(2023, 3, 6, 14) },
      { name: "Task 2.3", start: new Date(2023, 3, 6, 15), end: new Date(2023, 3, 6, 17) }
    ]
  },
  {
    class: "Class 3",
    start: new Date(2023, 3, 6, 10),
    end: new Date(2023, 3, 6, 19),
    tasks: [
      { name: "Task 3.1", start: new Date(2023, 3, 6, 10), end: new Date(2023, 3, 6, 12) },
      { name: "Task 3.2", start: new Date(2023, 3, 6, 13), end: new Date(2023, 3, 6, 16) },
      { name: "Task 3.3", start: new Date(2023, 3, 6, 17), end: new Date(2023, 3, 6, 19) }
    ]
  }
];

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
  .attr("x", (d) => x(d.start))
  .attr("y", 0)
  .attr("width", (d) => x(d.end) - x(d.start))
  .attr("height", y.bandwidth())
  .style("fill", (d) => getColor(d));

// draw the subtask bars
groups
  .filter((d) => d.isTask)
  .append("rect")
  .attr("class", "task")
  .attr("x", (d) => x(d.start))
  .attr("y", y.bandwidth() / 4)
  .attr("width", (d) => x(d.end) - x(d.start))
  .attr("height", y.bandwidth() / 2)
  .style("fill", (d) => getColor(d.class));

const color_map = []

function getColor(d) {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  const color = `#${r.toString(16).padStart(2, '0')}` +
    `${g.toString(16).padStart(2, '0')}` +
    `${b.toString(16).padStart(2, '0')}`;

  return color;
}