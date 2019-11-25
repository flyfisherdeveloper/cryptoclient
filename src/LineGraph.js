import React from "react";
import Chart from "react-apexcharts";
import PropTypes from "prop-types";

class LineGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hours: 4,
            days: 7,
            months: 0,
            options: {
                chart: {
                    group: "DataCharts",
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
                    background: "#fff",
                },
                dataLabels: {
                    enabled: false
                },
                markers: {
                    size: 0,
                    style: 'full'
                },
                title: {
                    text: this.getTitle(),
                    style: {
                        fontSize: "32px"
                    },
                    align: "middle"
                },
                subtitle: {
                    text: this.getSubtitleText(),
                    style: {
                        fontSize: "16px"
                    },
                    offsetY: 40,
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
                            text: this.getYAxisText(),
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
                            formatter: () => this.props.isQuoteVolume ? this.props.quote : this.props.coin,
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

    getTitle() {
        return this.getPriceOrVolumeString() + " Chart for " + this.props.coin;
    }

    getPriceOrVolumeString() {
        return (this.props.isPrice ? "Price" : "Volume");
    }

    getYAxisText() {
        if (this.props.isPrice) {
            return "Price in " + this.props.quote;
        }
        return "Volume in " + (this.props.isQuoteVolume ? this.props.quote : this.props.coin);
    }

    getSubtitleText() {
        if (this.props.isPrice) {
            return "(Price in " + this.props.quote + ")";
        }
        return "(" + this.getYAxisText() + ")";
    }

    updateChart(hours, days, months) {
        this.setState({hours: hours, days: days, months: months}, () => {
            this.retrieveChartData();
        });
    }

    retrieveChartData() {
        const url = "http://localhost:8080/api/v1/binance/DayTicker/";
        let daysOrMonths = (this.state.months === 0 ? this.state.days + "d" : this.state.months + "M");
        fetch(url + this.props.symbol + "/" + this.state.hours + "h/" + daysOrMonths)
            .then(result => result.json())
            .then((json) => {
                let info = json.map((data) => {
                    let date = new Date(data.closeTime);
                    date.setMinutes(date.getMinutes() + 1);
                    let value = 0.0;
                    if (this.props.isQuoteVolume) {
                        value = data.quoteAssetVolume.toPrecision(2);
                    } else if (this.props.isPrice) {
                        value = data.close;
                    } else {
                        value = data.volume.toPrecision(2);
                    }
                    return [date.toLocaleString(), value];
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
        this.retrieveChartData();
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
    quote: PropTypes.string,
    coin: PropTypes.string,
    isQuoteVolume: PropTypes.bool,
    isPrice: PropTypes.bool,
    hours: PropTypes.number,
    days: PropTypes.number,
    months: PropTypes.number,
};
export default LineGraph;
