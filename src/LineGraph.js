import React from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";

class LineGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            options: {
                chart: {
                    group: "VolumeCharts",
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
                colors: ['#0706ea'],
                dataLabels: {
                    enabled: false
                },
                markers: {
                    size: 0
                },
                title: {
                    text: this.props.title,
                    style: {
                        fontSize: "32px"
                    },
                    align: "middle"
                },
                xaxis: {
                    axisTicks: {show: true},
                    axisBorder: {
                        show: true,
                        color: '#000000',
                        height: 1,
                        width: '100%',
                        offsetX: 0,
                        offsetY: 0
                    },
                    type: "datetime",
                    labels: {
                        style: {
                            colors: [],
                            fontSize: '16px',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            cssClass: 'apexcharts-xaxis-label',
                        },
                        offsetX: -20,
                        offsetY: 0,
                    },
                },
                yaxis: [
                    {
                        axisTicks: {show: true},
                        axisBorder: {
                            show: true,
                            color: '#000000',
                            height: 1,
                            width: '100%',
                            offsetX: 0,
                            offsetY: 0
                        },
                        labels: {
                            show: true,
                            minWidth: 60,
                            style: {
                                fontSize: '16px'
                            }
                        },
                        title: {
                            text: "Volume in " + this.props.quoteSymbol,
                            rotate: 90,
                            offsetX: -7,
                            offsetY: 0,
                            style: {
                                color: undefined,
                                fontSize: '24px',
                                fontFamily: 'Helvetica, Arial, sans-serif',
                                cssClass: 'apexcharts-yaxis-title',
                            },
                        },
                        tooltip: {enabled: false}
                    },
                ],
                stroke: {
                    width: 2.5
                },
                legend: {
                    show: true
                },
                tooltip: {
                    shared: true,
                    theme: "dark",
                    x: {
                        format: "MM/dd/yyyy"
                    },
                    y: {
                        title: {
                            formatter: () => "Volume in " + this.props.quoteSymbol,
                        }
                    }
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
                    let vol = Number(d.quoteAssetVolume);
                    return [date, vol.toPrecision(2)];
                });
                let seriesData = [{
                    data: info,
                    type: "line"
                }];
                this.setState({series: seriesData});
            }).catch(err => {
            if (err.name === 'AbortError') {
                console.log("error catch: " + err);
                return;
            }
            throw err;
        });
    }

    render() {
        return (
            <div style={{width: "100%", height: "100%"}}>
                <Chart
                    options={this.state.options}
                    series={this.state.series}
                    type="line"
                    height="100%"
                    width="100%"
                />
            </div>
        );
    }
}

LineGraph.propTypes = {
    symbol: PropTypes.string,
    quoteSymbol: PropTypes.string,
    title: PropTypes.string,
};
export default LineGraph;
