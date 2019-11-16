import React from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";

class LineGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hr: 4,
            options: {
                chart: {
                    group: "VolumeCharts",
                    type: 'area',
                    animations: {
                        enabled: true
                    },
                    zoom: {
                        type: "x",
                        enabled: true
                    },
                    toolbar: {
                        show: true,
                        tools: {
                            download: false,
                            selection: true,
                            zoom: true,
                            zoomin: true,
                            zoomout: true,
                            pan: false,
                            reset: false,
                        },
                        autoSelected: 'zoom'
                    },
                    background: "#fff"
                },
                dataLabels: {
                    enabled: false
                },
                markers: {
                    size: 0,
                    style: 'full'
                },
                title: {
                    text: "7-Day Chart for " + this.props.symbol,
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
                    width: 2.5,
                    curve: 'straight'
                },
                legend: {
                    show: true
                },
                tooltip: {
                    shared: true,
                    theme: "dark",
                    x: {
                        format: "MM/dd/yyyy HH:mm"
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
                }
            ]
        };
    }

    updateHourChart(params) {
        this.setState({hr: params}, () => {
            this.retrieveData();
        });
    }

    retrieveData() {
        fetch('http://localhost:8080/api/v1/binance/7DayTicker/' + this.props.symbol + "/" + this.state.hr + "h")
            .then(result => result.json())
            .then((json) => {
                let info = json.map((d, i) => {
                    let date = new Date(d.closeTime);
                    date.setMinutes(date.getMinutes() + 1);
                    let vol = Number(d.quoteAssetVolume);
                    return [date.toLocaleString(), vol.toPrecision(2)];
                });
                let seriesData = [{
                    data: info,
                    type: "area",
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

    componentDidMount() {
        this.retrieveData();
    }

    render() {
        return (
            <div style={{width: "100%", height: "100%"}}>
                <Chart
                    options={this.state.options}
                    series={this.state.series}
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
    hr: PropTypes.number,
};
export default LineGraph;
