import $ from "jquery";
import Chartkick from "chartkick";
import Chart from "chart.js/auto";
import { X } from "./x";

Chartkick.use(Chart);

export function Display(element, position) {
  this.url = "";

  this.element = element;
  this.position = position || 0;
  this.figure = X("figure", { id: "chart-" + position });
  this.element.appendChild(this.figure);
  this.reload();
  this.rerender();
}

Display.prototype.reload = function () {
  let element = this.element;

  this.title = element.dataset.title;
  this.chart_type = element.dataset.chart_type;
  this.figure = element.querySelector("figure");
  this.artifacts = [];

  for (let id = 0; id < 10; ++id) {
    if (element.dataset["artifacts_" + id + "_name"])
      this.addArtifact(id).name = element.dataset["artifacts_" + id + "_name"];

    if (element.dataset["artifacts_" + id + "_label"])
      this.addArtifact(id).label =
        element.dataset["artifacts_" + id + "_label"];

    if (element.dataset["artifacts_" + id + "_min"])
      this.addArtifact(id).min = element.dataset["artifacts_" + id + "_min"];

    if (element.dataset["artifacts_" + id + "_max"])
      this.addArtifact(id).max = element.dataset["artifacts_" + id + "_max"];
  }
};

Display.prototype.addArtifact = function (id) {
  if (this.artifacts[id]) return this.artifacts[id];

  return (this.artifacts[id] = {
    label: "",
    source: "",
    name: null,
    min: null,
    max: null,
  });
};

Display.prototype.rerender = function () {
  let element,
    display = this;
  let field, label, input, option, form;

  let map = { artifacts: new Array(this.artifacts.length) };

  form = X(
    "form",
    X(
      "div",
      { class: "field" },
      X("label", "Title"),
      X("input", { name: "title", value: this.title }),
    ),
    X(
      "div",
      { class: "field" },
      X("label", "Type"),
      X(
        "select",
        { name: "chart_type" },
        X("option", this.chart_type, { value: this.chart_type }),
      ),
    ),
    ...this.artifacts.map(function (a, i) {
      return X(
        "div",
        { class: "field" },
        X("strong", a.source),
        X(
          "div",
          { class: "inline-field" },
          X("label", "min"),
          X("input", {
            name: "artifacts_" + i + "_min",
            value: a.min != null ? a.min : "",
            size: 6,
          }),
        ),
        X(
          "div",
          { class: "inline-field" },
          X("label", "max"),
          X("input", {
            name: "artifacts_" + i + "_max",
            value: a.max != null ? a.max : "",
            size: 6,
          }),
        ),
      );
    }),
    X(
      "actions",
      X("input", { type: "submit" }),
      X("a", "[x]", { href: "#", "data-cancel_configure_chart": "" }),
    ),
  );

  form.style.display = "none";

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let data = display.element.dataset;

    data.title = form.querySelector("[name=title]").value;
    data.chart_type = form.querySelector("[name=chart_type]").value;
    display.artifacts.forEach(function (a, i) {
      // data["artifacts_"+i+"_name"] = form.querySelector('[name=artifacts_'+i+'_name]').value;
      a.source = data["artifacts_" + i + "_source"] = form.querySelector(
        "[name=artifacts_" + i + "_source]",
      ).value;
      a.min = data["artifacts_" + i + "_min"] = form.querySelector(
        "[name=artifacts_" + i + "_min]",
      ).value;
      a.max = data["artifacts_" + i + "_max"] = form.querySelector(
        "[name=artifacts_" + i + "_max]",
      ).value;
    });

    form.remove();
    display.element.classList.remove("editing");

    display.reload();
    display.redraw();
  });

  this.element.appendChild(form);

  this.element.prepend(
    X(
      "legend",
      this.title,
      { contentEditable: true },
      X("a", "configure", {
        href: "#",
        "data-configure_chart_id": this.figure.id,
      }),
    ),
  );

  this.redraw();

  return map;
};

Display.prototype.redraw = function () {
  let chart, options;

  options = {
    xmin: this.artifacts[0].min,
    xmax: this.artifacts[0].max,
    min: this.artifacts[1].min,
    max: this.artifacts[1].max,
  };

  if ((chart = Chartkick.charts[this.figure.id])) {
    chart.setOptions(options);
    chart.redraw();
  } else {
  }
};

Display.prototype.update = function () {
  let display = this;

  let options = {
    xmin: this.artifacts[0].min,
    xmax: this.artifacts[0].max,
    min: this.artifacts[1].min,
    max: this.artifacts[1].max,
  };

  let datasets = [];

  for (let id in display.artifacts) {
    if ((id = parseInt(id)) % 2 == 1) continue;

    let pairs = [];
    let x = display.artifacts[id].value;

    x.forEach(function (x, i) {
      let y = display.artifacts[id + 1].value;
      pairs.push([x, y[i]]);
    });

    let ptsize = pairs.length > 30 ? 0.3 : 3;
    ptsize = 0.3;
    datasets.push({
      data: pairs,
      dataset: { radius: ptsize, pointStyle: "cross" },
    });
  }

  let updated = false;

  Chartkick.eachChart(function (chart) {
    if (chart.element == display.figure) {
      chart.setOptions({
        ...options,
        curve: false,
        empty: "No data!",
        download: true,
      });

      chart.updateData(datasets);

      updated = true;
    }
  });

  if (!updated) {
    let type =
      this.chart_type == "line"
        ? "LineChart"
        : this.chart_type == "scatter"
          ? "ScatterChart"
          : this.chart_type;

    if (Chartkick[type]) {
      options = { ...options, curve: false, empty: "No data!", download: true };
      new Chartkick[type](this.figure.id, datasets, options);
    } else if (this.chart_type == "table") {
      let table = this.figure.querySelector("table");
      table && table.remove();

      table = X(
        "table",
        X("thead", X("tr", X("th", "x"), X("th", "y"))),
        X(
          "tbody",
          ...datasets.map(function (xy) {
            return X(
              "tr",
              X("td", display.fmt(xy[0])),
              X("td", display.fmt(xy[1])),
            );
          }),
        ),
      );

      this.figure.prepend(table);
    }
  }
};

Display.prototype.fmt = function (x) {
  if (typeof x == "number") {
    x = x.toFixed(4);
    return parseFloat(x);
  } else if (typeof x == "undefined") {
    x = "???";
  } else {
    x = x.replace(/(\.\d{1,4})\d*?/, "$1");
  }
  return x;
};

$(document).on("click", "a[data-configure_chart_id]", function (e) {
  e.preventDefault();

  let display = $("#" + e.target.dataset.configure_chart_id).parents(
    ".display",
  );
  let figure = $("figure", display);
  let form = $("form", display);

  display.addClass("editing");

  form.slideDown(200);
});

$(document).on("click", "a[data-cancel_configure_chart]", function (e) {
  e.preventDefault();

  let form = $(e.target).parents("form");
  let pane = form.parents("[data-chart_type]");
  let figure = form.parents("fieldset").find("figure");

  e.preventDefault();
  pane.removeClass("editing");
  form.slideUp(200);
});

// The figures of the page, drawn from the messages of a run.
export class Workspace {
  displays = [];

  handle(event) {
    switch (event.type) {
      case "plot": {
        let element;
        let id = event.figure;

        if (this.displays[id]) {
          element = this.displays[id].element;
        } else {
          element = X("fieldset", { class: "display" });
        }

        element.id = "display-" + id;
        element.dataset.title = "Figure " + id;
        element.dataset.artifacts_0_name = "x";
        element.dataset.artifacts_1_name = "y";
        element.dataset.chart_type = event.chart;

        // TODO delay reload until on compute
        let display;
        if ((display = this.displays[id])) display.reload();
        else
          display = this.displays[id] = new Display(
            element,
            this.displays.length,
          );

        event.series.forEach(function (series, i) {
          display.addArtifact(2 * i).value = series.x;
          display.addArtifact(2 * i + 1).value = series.y;
        });
        break;
      }

      case "limits": {
        let figure = this.displays[event.figure];
        let artifact = event.axis == "x" ? 0 : 1;

        figure.element.dataset["artifacts_" + artifact + "_min"] = event.min;
        figure.element.dataset["artifacts_" + artifact + "_max"] = event.max;
        figure.artifacts[artifact].min = event.min;
        figure.artifacts[artifact].max = event.max;
        figure.redraw();
        break;
      }

      case "done": {
        this.displays.forEach(function (d) {
          let param =
            d.title.replace(/\s+/g, "-").replace(/[^-\w]/g, "") +
            "-" +
            d.position;
          d.element.id = "chart-" + param;

          if (!$(".display-area").children("#" + d.element.id).length)
            $(".display-area").append(d.element);
        });

        let ids = this.displays.map((d) => d.element.id);
        $(".display-area")
          .children()
          .each(function () {
            if (!ids.includes(this.id)) $(this).remove();
          });

        this.displays.forEach(function (display) {
          display.update();
        });
        break;
      }
    }
  }
}
