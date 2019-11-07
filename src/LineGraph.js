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
                        axisTicks: {show: true},
                        axisBorder: {show: true},
                        labels: {
                            show: true,
                            minWidth: 60
                        },
                        tooltip: {enabled: false},
                        min: min => {
                            return min;
                        },
                        max: max => {
                            return max;
                        }
                    },
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
                        format: "MM/dd/yyyy"
                    },
                }
            },

            series: [
                {
                    data: [],
                    type: "line"
                }
            ]
        };
    }

    componentDidMount() {
        fetch('http://localhost:8080/api/v1/binance/7DayTicker/' + this.props.symbol)
            .then(result => result.json())
            .then((json) => {
                let info = json.map((d, i) => {
                    let date = new Date(d.closeTime).toLocaleDateString();
                    let vol = d.quoteAssetVolume;
                    return [date, vol];
                });
                let seriesData = [{
                    data: info,
                    type: "line"
                }];
                this.setState({series: seriesData});
                console.log(seriesData);
            }).catch(err => {
            if (err.name === 'AbortError') {
                console.log("error catch: " + err);
                return;
            }
            throw err;
        });
    }

    render() {
        console.log("symbol in line: " + this.props.symbol);
        return (
            <div style={{width: "100%", height: "100%"}}>
                <div style={{width: "100%", height: "100%"}}>
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
