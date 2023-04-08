const data = await d3.csv('/data/weekly.csv');
data.forEach(item => {
  const startTimeParts = item.start_time.split(':');
  item.start_hour = parseInt(startTimeParts[0]);
  item.start_minute = parseInt(startTimeParts[1]);
  item.start_minutes = item.start_hour * 60 + item.start_minute;
  // delete item.start_time;
  // item.start_time = new Date(2023, 3, 6, item.start_hour, item.start_minute);
  
  const endTimeParts = item.end_time.split(':');
  item.end_hour = parseInt(endTimeParts[0]);
  item.end_minute = parseInt(endTimeParts[1]);
  item.end_minutes = item.end_hour * 60 + item.end_minute;
  // delete item.end_time;

  item.duration = item.end_minutes - item.start_minutes;
  // item.end_time = new Date(2023, 3, 6, item.end_hour, item.end_minute);
});

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const svg = d3.select('#svg_two');

// console.log(data);

// viewbox 0 0 700 600
function drawSVG() {
  const width = 700;
  const height = 600;

  const leftMargin = width * 0.05;
  const rightMargin = width * 0.05;
  const topMargin = height * 0.00;
  const bottomMargin = height * 0.00;

  const w = width - leftMargin - rightMargin;
  const h = height - topMargin - bottomMargin;

  svg.append('svg')
    .attr('x', 0)
    .attr('y', 0)
    .attr('id', 'svg_two_inner');

  const svgData = d3.select('#svg_two_inner')
    .attr('x', leftMargin)
    .attr('y', topMargin);

  // draw y lines
  for(let i = 0; i < days.length + 1; i++) {
    svgData.append('line')
      .attr('x1', (w / days.length) * i)
      .attr('x2', (w / days.length) * i)
      .attr('y1', 0)
      .attr('y2', h)
      .attr('style', 'stroke:grey;stroke-width:1');

    if (i >= 1 && i <= 7) {
      const day = days[i - 1];

      svgData.append('text')
        .attr('x', w / days.length * (i - 1) + 5)
        .attr('y', 15)
        .text(day.substring(0, 3).toUpperCase());
    }
  }

  // draw x lines (time 8am to 6pm => 8:00 to 18:00)
  const rows = (18 - 8 + 1) + 1;
  for(let i = 0; i < rows - 1; i++) {
    svgData.append('line')
      .attr('x1', 0)
      .attr('x2', w)
      .attr('y1', (h / rows) * (i + 1))
      .attr('y2', (h / rows) * (i + 1))
      .attr('style', 'stroke:grey;stroke-width:1');

    let time = (i + 8 > 12 ? `${i + 8 - 12}pm` : `${i + 8}am`);
    // append times
    svg.append('text')
      .attr('x', 7)
      .attr('y', (h / rows) * (i + 1) + 8)
      .text(time);
  }

  // draw boxes
  for(let i = 0; i < days.length; i++) {
    let day = days[i];

    const daywiseData = data.filter(item => item.day === day);
    daywiseData.sort((a, b) => {
      if (a.start_hour < b.start_hour) return -1;
      if (a.start_hour > b.start_hour) return 1;

      if (a.start_minute < b.start_minute) return -1;
      if (a.start_minute > b.start_minute) return 1;

      return 0;
    });

    function overlappingGroups() {
      let groups = [];
      let group = [];
      let latest = -1;
      for(let item of daywiseData) {
        if (item.start_minutes < latest) {
          group.push(item);
          latest = Math.max(latest, item.start_minutes + item.duration)
        } else {
          if (group.length > 0)
            groups.push(group);

          group = [item];
          latest = item.start_minutes + item.duration;
        }
      }
      groups.push(group);

      return groups;
    }

    // colors for labels
    const colorScheme = {
      College: 'rgba(213, 137, 54, 0.6)',
      Gym: 'rgba(164, 66, 0, 0.6)',
      Misc: 'rgba(239, 199, 194, 0.6)',
    };
    const colorSchemeOpaque = {
      College: 'rgba(213, 137, 54, 1)',
      Gym: 'rgba(164, 66, 0, 1)',
      Misc: 'rgba(239, 199, 194, 1)',
    };

    // find groups that overlap and display them
    const groups = overlappingGroups();
    for(let k = 0; k < groups.length; k++) {
      let group = groups[k];
      // (w / days.length)
      const space = w / days.length;
      const ww = space / group.length;
      const start = h / rows;
      const leftover = h - 2 * start;
      const padding = 2; // pixels

      // (h / rows) <- 1 hour, for item.duration / 60 hours
      const totalPaddingSpace = (group.length + 1) * padding;
      const ww2 = (space - totalPaddingSpace) / group.length;
      for(let j = 0; j < group.length; j++) {
        const item = group[j];

        svgData.append('rect')
          .attr('x', space * i + ww2 * j + padding * (j + 1))
          .attr('y', start + (item.start_minutes - 8 * 60) / (18 * 60 - 8 * 60) * (leftover) + padding)
          .attr('rx', 3)
          .attr('ry', 3)
          .attr('width', ww2)
          .attr('height', (item.duration / 60) * (h / rows) - 2 * padding)
          .attr('onmouseover', `evt.target.setAttribute('fill', '${colorSchemeOpaque[item.label]}');`)
          .attr('onmouseout', `evt.target.setAttribute('fill', '${colorScheme[item.label]}');`)
          .attr('fill', colorScheme[item.label])
          .attr('id', 'weekly' + i + '-' + j + '-' + k);

        $('#weekly' + i + '-' + j + '-' + k).qtip({
          content: item.description,
          position: {
            my: 'bottom left',
            at: 'right center',
            target: 'mouse'
          },
          style: { 
            classes: 'qtip-dark' 
          }
        });

        svgData.append('text')
          .attr('x', space * i + ww2 * j + padding * (j + 1) + 4)
          .attr('y', start + (item.start_minutes - 8 * 60) / (18 * 60 - 8 * 60) * (leftover) + 14)
          .attr('style', 'font-weight: bold')
          .text(item.title);

        svgData.append('text')
          .attr('x', space * i + ww2 * j + padding * (j + 1) + 4)
          .attr('y', start + (item.start_minutes - 8 * 60) / (18 * 60 - 8 * 60) * (leftover) + 24)
          .text(item.start_time);
      }
    }

    // console.log(groups);
  }
}

drawSVG();