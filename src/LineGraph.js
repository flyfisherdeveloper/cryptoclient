import React from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";

class LineGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options: {
                chart: {
                    group: "BacktestCharts",
                    id: "1",
                    animations: {
                        enabled: false
                    },
                    stacked: false,
                    zoom: {
                        type: "x",
                        enabled: true
                    },
                    toolbar: {
                        autoSelected: "zoom",
                        show: true
                    },
                    background: "#fff"
                },
                annotations: {
                    points: []
                },
                fill: {
                    type: "solid",
                    opacity: [0.35, 1]
                },
                dataLabels: {
                    enabled: false
                },
                markers: {
                    size: 0
                },
                title: {
                    text: this.props.symbol,
                    align: "left"
                },
                xaxis: {
                    type: "datetime"
                },
                yaxis: [
                    {
                        axisTicks: { show: true },
                        axisBorder: { show: true },
                        labels: {
                            show: true,
                            minWidth: 60
                        },
                        tooltip: { enabled: false },
                        min: min => {
                            return min;
                        },
                        max: max => {
                            return max;
                        }
                    },
                    {
                        axisTicks: { show: true },
                        axisBorder: { show: true },
                        labels: {
                            show: true,
                            minWidth: 60
                        },
                        tooltip: { enabled: false },
                        min: min => {
                            return min;
                        },
                        max: max => {
                            return max;
                        }
                    }
                ],
                stroke: {
                    width: 1.5
                },
                legend: {
                    show: true
                },
                tooltip: {
                    shared: true,
                    x: {
                        format: "dd MMM - HH : mm "
                    },
                }
            },

            series: [
                {
                    data: [
                        [1, 10000],
                        [2, 15000],
                        [3, 11234],
                        [4, 31023],
                        [5, 40123],
                        [6, 11249]
                    ],
                    type: "line"
                },
                {
                    data: [[1, 3], [2, 5], [3, 2], [4, 1], [5, 3], [6, 2]],
                    type: "line"
                }
            ]
        };
    }

    render() {
        return (
            <div style={{width: "100%", height: "100%"}}>
                <div style={{ width: "100%", height: "100%" }}>
                    <Chart
                        options={this.state.options}
                        series={this.state.series}
                        type="line"
                        height="100%"
                        width="100%"
                    />
                </div>
            </div>
        );
    }
}

LineGraph.propTypes = {
    symbol: PropTypes.string,
};
export default LineGraph;
