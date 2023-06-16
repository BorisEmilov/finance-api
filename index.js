const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const request = require('request');
const path = require('path');

const app = express();

const PORT = (process.env.PORT || 5000);


app.get('/popular', async (req, res) => {
    try {
        let result = [];
        const html = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/crypto/`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });

        const $ = cheerio.load(html);


        $('#scr-res-table table tbody .simpTblRow').each((index, element) => {
            const crypto = {
                id: '',
                picture: '',
                symbols: '',
                crypto_vs_currency: '',
                price: '',
                change: '',
                chnage_percentage: '',
                market_cap: '',
                volume: ''
            };

            const crypto_vs_currency = $(element).find('td:eq(1)').text().trim();
            const img = $(element).find('td:eq(0) img').attr('src');
            const symbols = $(element).find('td:eq(0) a').text().trim();
            const price = $(element).find('td:eq(2) fin-streamer').attr('value');
            const change = $(element).find('td:eq(3) fin-streamer').attr('value');
            const chnage_percentage = $(element).find('td:eq(4) fin-streamer').attr('value');
            const market_cap = $(element).find('td:eq(4) fin-streamer').attr('value');
            const volume = $(element).find('td:eq(5) fin-streamer').attr('value');

            crypto.volume = volume
            crypto.market_cap = market_cap
            crypto.chnage_percentage = chnage_percentage
            crypto.change = change
            crypto.price = price
            crypto.symbols = symbols
            crypto.picture = img
            crypto.crypto_vs_currency = crypto_vs_currency
            crypto.id = symbols
            result.push(crypto)
        })

        res.json(result);
    } catch (error) {
        console.log('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


// COIN SUMMARY BY ID
app.get('/coin-data/summary/:coin_id', async (req, res) => {
    try {
        const { coin_id } = req.params
        let result = [];
        const html = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/quote/${coin_id}`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });

        const $ = cheerio.load(html);

        const change = $(`fin-streamer[data-symbol=${coin_id}]:eq(1)`).attr('value');
        const change_percentage = $(`fin-streamer[data-symbol=${coin_id}]:eq(2) span`).text().trim();
        const crypto_vs_currency = $('h1').text().trim();
        const price = $(`fin-streamer[data-symbol=${coin_id}]`).attr('value');
        const time = $(`div#quote-market-notice span`).text().trim();
        const prev_close = $(`div[data-test=left-summary-table] table tbody tr:eq(0) td:eq(1)`).text().trim();
        const open = $(`div[data-test=left-summary-table] table tbody tr:eq(1) td:eq(1)`).text().trim();
        const day_range = $(`div[data-test=left-summary-table] table tbody tr:eq(2) td:eq(1)`).text().trim();
        const day52_range = $(`div[data-test=left-summary-table] table tbody tr:eq(3) td:eq(1)`).text().trim();
        const start_date = $(`div[data-test=left-summary-table] table tbody tr:eq(4) td:eq(1)`).text().trim();

        result.push({
            symbol: crypto_vs_currency,
            date: time,
            price: price,
            change: change,
            change_percentage: change_percentage,
            prev_close: prev_close,
            open: open,
            day_range: day_range,
            day52_range: day52_range,
            start_date: start_date,
            market_cap: '',
            circulating_suply: '',
            volume: '',
            volume_24h: ''
        })


        res.json(result);
    } catch (error) {
        console.log('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


// COIN HISTORICAL BY ID
app.get('/coin-data/historical/:coin_id', async (req, res) => {
    try {
        const { coin_id } = req.params
        let result = [];
        const html = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/quote/${coin_id}/history`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });

        const $ = cheerio.load(html);

        const crypto = {
            historical: []
        }

        $('table tbody tr').each((index, element) => {
            const historical = { date: '', open: '', close: '', hight: '', low: '', volume: '' }

            const date = $(element).find('td:eq(0)').text().trim();
            const open = $(element).find('td:eq(1)').text().trim();
            const hight = $(element).find('td:eq(2)').text().trim();
            const low = $(element).find('td:eq(3)').text().trim();
            const close = $(element).find('td:eq(4)').text().trim();
            const volume = $(element).find('td:eq(6)').text().trim();

            historical.close = close
            historical.hight = hight
            historical.low = low
            historical.volume = volume
            historical.open = open
            historical.date = date;
            crypto.historical.push(historical)
        })
        result.push(crypto)


        res.json(result);
    } catch (error) {
        console.log('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

//-----------------------------------CALENDAR-------------------------------------
const currentDate = new Date();
const year = currentDate.getFullYear();
let month = currentDate.getMonth() + 1;
let day = currentDate.getDate();

if (month < 10) {
    month = `0${currentDate.getMonth() + 1}`;
} else {
    month = currentDate.getMonth() + 1;
};

if (day < 10) {
    day = `0${currentDate.getDate()}`;
} else {
    day = currentDate.getDate();
};


let day_interval = currentDate.getDate() + 7;

if (day_interval < 10) {
    day_interval = `0${currentDate.getDate() + 7}`;
} else {
    day_interval = currentDate.getDate() + 7;
};

const from_date = `${year}-${month}-${day}`;
const to_date = `${year}-${month}-${day_interval}`;

// EVENTS SELECTOR CALENDAR
app.get('/calendar-selector-7day', async (req, res) => {
    try {
        let result = [];
        const html = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/calendar?from=${from_date}&to=${to_date}`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });

        const $ = cheerio.load(html);

        $('#fin-cal-events ul li').each((index, element) => {
            const calendar = { date: { number: '', month: '', day: '' }, earnings: '', stok_split: '', ipo: '', events: '' }

            const number = $(element).find('div span:eq(0)').text().trim();
            const month = $(element).find('div span:eq(1)').text().trim();
            const day = $(element).find('div span:eq(3)').text().trim();
            const earnings = $(element).find('a:eq(0)').text().trim();
            const stok_split = $(element).find('a:eq(1)').text().trim();
            const ipo = $(element).find('a:eq(2)').text().trim();
            const events = $(element).find('a:eq(3)').text().trim();

            calendar.stok_split = stok_split
            calendar.ipo = ipo
            calendar.events = events
            calendar.earnings = earnings
            calendar.date.number = number
            calendar.date.month = month
            calendar.date.day = day
            result.push(calendar)
        })



        res.json(result);
    } catch (error) {
        console.log('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// EARNINGS (yyyy-mm-dd)
app.get('/search/calendar/earnings/:date?', async (req, res) => {
    try {
        const { date } = req.params
        let result = [];
        const html = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/calendar/earnings?day=${!date ? from_date : date}`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });

        const $ = cheerio.load(html);

        const selected_date = $('#fin-cal-table h3 span:eq(0)').text().trim();
        result.push(selected_date)


        $('#cal-res-table table tbody tr').each((index, element) => {
            const earnings = { date: '', symbol: '', company: '', event_name: '', call_time: '', eps_estimated: '', eps_reported: '', surprise_percentage: '' }

            const symbol = $(element).find('td:eq(0) a').text().trim();
            const company = $(element).find('td:eq(1)').text().trim();
            const event_name = $(element).find('td:eq(2)').text().trim();
            const call_time = $(element).find('td:eq(3)').text().trim();
            const eps_estimated = $(element).find('td:eq(4)').text().trim();
            const eps_reported = $(element).find('td:eq(5)').text().trim();
            const surprise_percentage = $(element).find('td:eq(6)').text().trim();

            earnings.eps_estimated = eps_estimated
            earnings.eps_reported = eps_reported
            earnings.surprise_percentage = surprise_percentage
            earnings.call_time = call_time
            earnings.event_name = event_name
            earnings.company = company
            earnings.symbol = symbol
            result.push(earnings)
        })



        res.json(result);
    } catch (error) {
        console.log('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

// STOCK SPLITS
app.get('/search/calendar/splits/:date?', async (req, res) => {
    try {
        const { date } = req.params
        let result = [];
        const html = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/calendar/splits?day=${!date ? from_date : date}`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });

        const $ = cheerio.load(html);

        $('table:eq(0) tbody tr').each((index, element) => {
            const split = {symbol: '', company: '', payable_on: '', optionable: '', ratio: ''}

            const symbol = $(element).find('td:eq(0) a').text().trim();
            const company = $(element).find('td:eq(1)').text().trim();
            const payable_on = $(element).find('td:eq(2) span').text().trim();
            const optionable = $(element).find('td:eq(3) ').text().trim();
            const ratio = $(element).find('td:eq(4)').text().trim();

            split.symbol = symbol
            split.company = company
            split.payable_on = payable_on
            split.optionable = optionable
            split.ratio = ratio

            result.push(split)
        })


        res.json(result);
    } catch (error) {
        console.log('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
})

// IPO
app.get('/search/calendar/ipo/:date?', async (req, res) => {
    try {
        const { date } = req.params
        let result = [];
        const html = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/calendar/ipo?day=${!date ? from_date : date}`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });

        const $ = cheerio.load(html);

        $('table:eq(0) tbody tr').each((index, element) => {
            const ipos = {symbol: '', company: '', exchange: '', date: '', price_range: '', price: '', currency: '', shares: '', actions: ''}

            const symbol = $(element).find('td:eq(0) a').text().trim();
            const company = $(element).find('td:eq(1)').text().trim();
            const date = $(element).find('td:eq(2)').text().trim();
            const exchange = $(element).find('td:eq(3) span').text().trim();
            const price_range = $(element).find('td:eq(4)').text().trim();
            const price = $(element).find('td:eq(5)').text().trim();
            const currency = $(element).find('td:eq(6)').text().trim();
            const shares = $(element).find('td:eq(7)').text().trim();
            const actions = $(element).find('td:eq(8)').text().trim();

            ipos.symbol = symbol
            ipos.company = company
            ipos.date = date
            ipos.exchange = exchange
            ipos.price_range = price_range
            ipos.price = price
            ipos.currency = currency
            ipos.shares = shares
            ipos.actions = actions

            result.push(ipos)
        })


        res.json(result);
    } catch (error) {
        console.log('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
})

// ECONOMIC EVENTS
app.get('/search/calendar/economic/:date?', async (req, res) => {
    try {
        const { date } = req.params
        let result = [];
        const html = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/calendar/economic?day=${!date ? from_date : date}`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });

        const $ = cheerio.load(html);

        $('table:eq(0) tbody tr').each((index, element) => {
            const econimic = {event: '', country: '', event_time: '', for_: '', actual: '', mkt_expectation: '', prior: '', revised: ''}

            const event = $(element).find('td:eq(0)').text().trim();
            const country = $(element).find('td:eq(1)').text().trim();
            const event_time = $(element).find('td:eq(2)').text().trim();
            const for_ = $(element).find('td:eq(3)').text().trim();
            const actual = $(element).find('td:eq(4)').text().trim();
            const mkt_expectation = $(element).find('td:eq(5)').text().trim();
            const prior = $(element).find('td:eq(6)').text().trim();
            const revised = $(element).find('td:eq(7)').text().trim();

            econimic.country = country
            econimic.event_time = event_time
            econimic.for_ = for_
            econimic.actual = actual
            econimic.mkt_expectation = mkt_expectation
            econimic.prior = prior
            econimic.revised = revised
            econimic.event = event

            result.push(econimic)
        })

        res.json(result);
    } catch (error) {
        console.log('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
})


//----------------------------------------SEARCH-------------------------------------
app.get('/search/:searchQuery', async (req, res) => {
    try {
        const { searchQuery } = req.params
        const asset = {
            symbol: '',
            cap: '',
            price: '',
            variation: '',
            variation_percentage: '',
            summary: {
                prev_close: '',
                open: '',
                bid: '',
                ask: '',
                days_range: '',
                volume: '',
                avg_volume: '',
                market_cap: '',
            },
            statistics: {
                valuation: {
                    market_cap: '',
                    enterprise_value: '',
                    trailing: '',
                    peg_ratio: '',
                    price_sales: '',
                    price_book: '',
                    enterprise_value_revenue: ''
                },
                price_history: {
                    beta: '',
                    weak_52_change: '',
                    weak_52_hight: '',
                    weak_52_low: '',
                    ma_50_day: '',
                    ma_200_day: '',
                },
                profitability: {
                    profit_margin: '',
                    operating_margin: ''
                },
                income_statement: {
                    revenue: '',
                    revenue_per_share: '',
                    gross_profit: '',
                    net_income_ttm: '',
                    diluted: ''
                },
                balance: {
                    total_cash: '',
                    total_cash_share: '',
                    total_debit: '',
                    total_deb_equity: '',
                    current_ratio: ''
                },
                cash_flow: {
                    operating_cash: '',
                    levered_free_cash: ''
                },
                dividends_slipts: {
                    foroward_anual_dividend_ratio: '',
                    foroward_anual_dividend_yeld: '',
                    trailing_anual_dividend_rate: '',
                    trailing_anual_dividend_yeld: '',
                    payout_ratio: '',
                    dividend_date: '',
                    ex_dividend_rate: '',
                    last_split_factor: '',
                    last_split_date: '',
                }
            },
            historical_data: [],
            options: [],
            holders: {
                institutional_holders: [],
                mutual_holders: []
            }
        };


        const html = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/quote/${searchQuery}`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });

        const $ = cheerio.load(html);

        const symbol = $('h1:eq(0)').text().trim();
        const cap = $('#quote-header-info span:eq(0)').text().trim();
        const price = $(`fin-streamer[data-symbol=${searchQuery}]:eq(0)`).text().trim();
        const variation = $(`fin-streamer[data-symbol=${searchQuery}]:eq(1)`).text().trim();
        const variation_percentage = $(`fin-streamer[data-symbol=${searchQuery}]:eq(2)`).text().trim();

        const prev_close = $(`table tbody tr:eq(0) td:eq(1)`).text().trim();
        const open = $(`table tbody tr:eq(1) td:eq(1)`).text().trim();
        const bid = $(`table tbody tr:eq(2) td:eq(1)`).text().trim();
        const ask = $(`table tbody tr:eq(3) td:eq(1)`).text().trim();
        const days_range = $(`table tbody tr:eq(4) td:eq(1)`).text().trim();
        const volume = $(`table tbody tr:eq(6) td:eq(1)`).text().trim();
        const avg_volume = $(`table tbody tr:eq(7) td:eq(1)`).text().trim();
        const market_cap = $(`table tbody tr:eq(8) td:eq(1)`).text().trim();

        asset.summary.market_cap = market_cap
        asset.summary.avg_volume = avg_volume
        asset.summary.volume = volume
        asset.summary.days_range = days_range
        asset.summary.ask = ask
        asset.summary.bid = bid
        asset.summary.open = open
        asset.summary.prev_close = prev_close
        asset.variation_percentage = variation_percentage
        asset.variation = variation
        asset.price = price
        asset.cap = cap
        asset.symbol = symbol


        // STATICS
        const html2 = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/quote/${searchQuery}/key-statistics`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });
        const $2 = cheerio.load(html2);

        const stat_market_cap = $2(`table tbody tr:eq(0) td:eq(1)`).text().trim();
        const enterprise_value = $2(`table tbody tr:eq(1) td:eq(1)`).text().trim();
        const trailing = $2(`table tbody tr:eq(2) td:eq(1)`).text().trim();
        const peg_ratio = $2(`table tbody tr:eq(4) td:eq(1)`).text().trim();
        const price_sales = $2(`table tbody tr:eq(5) td:eq(1)`).text().trim();
        const price_book = $2(`table tbody tr:eq(6) td:eq(1)`).text().trim();
        const enterprise_value_revenue = $2(`table tbody tr:eq(7) td:eq(1)`).text().trim();

        asset.statistics.valuation.enterprise_value_revenue = enterprise_value_revenue
        asset.statistics.valuation.price_book = price_book
        asset.statistics.valuation.price_sales = price_sales
        asset.statistics.valuation.peg_ratio = peg_ratio
        asset.statistics.valuation.trailing = trailing
        asset.statistics.valuation.enterprise_value = enterprise_value
        asset.statistics.valuation.market_cap = stat_market_cap

        const beta = $2(`table:eq(1) tbody tr:eq(0) td:eq(1)`).text().trim();
        const weak_52_change = $2(`table:eq(1) tbody tr:eq(1) td:eq(1)`).text().trim();
        const weak_52_hight = $2(`table:eq(1) tbody tr:eq(3) td:eq(1)`).text().trim();
        const weak_52_low = $2(`table:eq(1) tbody tr:eq(4) td:eq(1)`).text().trim();
        const ma_50_day = $2(`table:eq(1) tbody tr:eq(5) td:eq(1)`).text().trim();
        const ma_200_day = $2(`table:eq(1) tbody tr:eq(6) td:eq(1)`).text().trim();

        asset.statistics.price_history.ma_50_day = ma_50_day
        asset.statistics.price_history.ma_200_day = ma_200_day
        asset.statistics.price_history.weak_52_change = weak_52_change
        asset.statistics.price_history.weak_52_hight = weak_52_hight
        asset.statistics.price_history.weak_52_low = weak_52_low
        asset.statistics.price_history.beta = beta

        const profit_margin = $2(`table:eq(5) tbody tr:eq(0) td:eq(1)`).text().trim();
        const operating_margin = $2(`table:eq(5) tbody tr:eq(1) td:eq(1)`).text().trim();

        asset.statistics.profitability.profit_margin = profit_margin
        asset.statistics.profitability.operating_margin = operating_margin

        const revenue = $2(`table:eq(7) tbody tr:eq(0) td:eq(1)`).text().trim();
        const revenue_per_share = $2(`table:eq(7) tbody tr:eq(1) td:eq(1)`).text().trim();
        const gross_profit = $2(`table:eq(7) tbody tr:eq(3) td:eq(1)`).text().trim();
        const net_income_ttm = $2(`table:eq(7) tbody tr:eq(5) td:eq(1)`).text().trim();
        const diluted = $2(`table:eq(7) tbody tr:eq(6) td:eq(1)`).text().trim();

        asset.statistics.income_statement.revenue_per_share = revenue_per_share
        asset.statistics.income_statement.gross_profit = gross_profit
        asset.statistics.income_statement.net_income_ttm = net_income_ttm
        asset.statistics.income_statement.diluted = diluted
        asset.statistics.income_statement.revenue = revenue

        const total_cash = $2(`table:eq(8) tbody tr:eq(0) td:eq(1)`).text().trim();
        const total_cash_share = $2(`table:eq(8) tbody tr:eq(1) td:eq(1)`).text().trim();
        const total_debit = $2(`table:eq(8) tbody tr:eq(2) td:eq(1)`).text().trim();
        const total_deb_equity = $2(`table:eq(8) tbody tr:eq(3) td:eq(1)`).text().trim();
        const current_ratio = $2(`table:eq(8) tbody tr:eq(4) td:eq(1)`).text().trim();

        asset.statistics.balance.total_cash_share = total_cash_share
        asset.statistics.balance.total_debit = total_debit
        asset.statistics.balance.total_deb_equity = total_deb_equity
        asset.statistics.balance.current_ratio = current_ratio
        asset.statistics.balance.total_cash = total_cash

        const operating_cash = $2(`table:eq(9) tbody tr:eq(0) td:eq(1)`).text().trim();
        const levered_free_cash = $2(`table:eq(9) tbody tr:eq(1) td:eq(1)`).text().trim();

        asset.statistics.cash_flow.operating_cash = operating_cash
        asset.statistics.cash_flow.levered_free_cash = levered_free_cash

        const foroward_anual_dividend_ratio = $2(`table:eq(3) tbody tr:eq(0) td:eq(1)`).text().trim();
        const foroward_anual_dividend_yeld = $2(`table:eq(3) tbody tr:eq(1) td:eq(1)`).text().trim();
        const trailing_anual_dividend_rate = $2(`table:eq(3) tbody tr:eq(2) td:eq(1)`).text().trim();
        const trailing_anual_dividend_yeld = $2(`table:eq(3) tbody tr:eq(3) td:eq(1)`).text().trim();
        const payout_ratio = $2(`table:eq(3) tbody tr:eq(5) td:eq(1)`).text().trim();
        const dividend_date = $2(`table:eq(3) tbody tr:eq(6) td:eq(1)`).text().trim();
        const ex_dividend_rate = $2(`table:eq(3) tbody tr:eq(7) td:eq(1)`).text().trim();
        const last_split_factor = $2(`table:eq(3) tbody tr:eq(8) td:eq(1)`).text().trim();
        const last_split_date = $2(`table:eq(3) tbody tr:eq(9) td:eq(1)`).text().trim();

        asset.statistics.dividends_slipts.foroward_anual_dividend_ratio = foroward_anual_dividend_ratio
        asset.statistics.dividends_slipts.foroward_anual_dividend_yeld = foroward_anual_dividend_yeld
        asset.statistics.dividends_slipts.trailing_anual_dividend_rate = trailing_anual_dividend_rate
        asset.statistics.dividends_slipts.trailing_anual_dividend_yeld = trailing_anual_dividend_yeld
        asset.statistics.dividends_slipts.payout_ratio = payout_ratio
        asset.statistics.dividends_slipts.dividend_date = dividend_date
        asset.statistics.dividends_slipts.ex_dividend_rate = ex_dividend_rate
        asset.statistics.dividends_slipts.last_split_factor = last_split_factor
        asset.statistics.dividends_slipts.last_split_date = last_split_date


        // HISTORICAL DATA
        function getUnixTimestamp(date) {
            return Math.floor(date.getTime() / 1000);
        }
        const currentDate = new Date();
        const intervalInDays = 180;
        const intervalInMilliseconds = intervalInDays * 24 * 60 * 60 * 1000;
        const startDate = new Date(currentDate.getTime() - intervalInMilliseconds);
        const endDate = currentDate;
        const period1 = getUnixTimestamp(startDate);
        const period2 = getUnixTimestamp(endDate);

        const html3 = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/quote/${searchQuery}/history?period1=${period1}&period2=${period2}&interval=1d&filter=history&frequency=1d`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });
        const $3 = cheerio.load(html3);


        $3('table[data-test=historical-prices] tbody tr').each((index, element) => {
            const dayly_historical = { date: '', open: '', hight: '', low: '', close: '', volume: '' }

            const date = $3(element).find('td:eq(0) span').text().trim();
            const open = $3(element).find('td:eq(1) span').text().trim();
            const hight = $3(element).find('td:eq(2) span').text().trim();
            const low = $3(element).find('td:eq(3) span').text().trim();
            const close = $3(element).find('td:eq(4) span').text().trim();
            const volume = $3(element).find('td:eq(6) span').text().trim();

            dayly_historical.open = open
            dayly_historical.close = close
            dayly_historical.hight = hight
            dayly_historical.low = low
            dayly_historical.volume = volume
            dayly_historical.date = date

            asset.historical_data.push(dayly_historical)
        })


        // OPTIONS
        const html4 = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/quote/${searchQuery}/options?`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });
        const $4 = cheerio.load(html4);
        $4('table.list-options tbody tr').each((index, element) => {
            const option = {contract: '', last_day: '', strike: '', last_price: '', bid: '', ask: '', change: '',change_percentage: '' ,volume: '', open_interest: ''}

            const contract = $(element).find('td:eq(0) a').text().trim();
            const last_day = $(element).find('td:eq(1)').text().trim();
            const strike = $(element).find('td:eq(2) a').text().trim();
            const last_price = $(element).find('td:eq(3)').text().trim();
            const bid = $(element).find('td:eq(4)').text().trim();
            const ask = $(element).find('td:eq(5)').text().trim();
            const change = $(element).find('td:eq(6) span').text().trim();
            const change_percentage = $(element).find('td:eq(7) span').text().trim();
            const volume = $(element).find('td:eq(8)').text().trim();
            const open_interest= $(element).find('td:eq(9)').text().trim();

            option.last_day = last_day
            option.contract = contract
            option.open_interest = open_interest
            option.strike = strike
            option.last_price = last_price
            option.bid = bid
            option.ask = ask
            option.change = change
            option.change_percentage = change_percentage
            option.volume = volume

            asset.options.push(option)
        })

        // HOLDERS
        const html5 = await new Promise((resolve, reject) => {
            request(`https://finance.yahoo.com/quote/${searchQuery}/holders?`, function (
                error,
                response,
                html
            ) {
                if (error) reject(error);
                else resolve(html);
            });
        });
        const $5 = cheerio.load(html5);
         // institutional holders
        $5('table:eq(1) tbody tr').each((index, element) => {
            const institutional_holders = {holder: '', shares: '', date_reported: '', out_percentage: ''}

            const holder = $5(element).find('td:eq(0)').text().trim();
            const shares = $5(element).find('td:eq(1)').text().trim();
            const date_reported = $5(element).find('td:eq(2)').text().trim();
            const out_percentage = $5(element).find('td:eq(3)').text().trim();

            institutional_holders.shares = shares
            institutional_holders.date_reported = date_reported
            institutional_holders.out_percentage = out_percentage
            institutional_holders.holder = holder

            asset.holders.institutional_holders.push(institutional_holders)
        })

        // mutual holders
        $5('table:eq(2) tbody tr').each((index, element) => {
            const mutual = {holder: '', shares: '', date_reported: '', out_percentage: ''}

            const holder = $(element).find('td:eq(0)').text().trim();
            const shares = $(element).find('td:eq(1)').text().trim();
            const date_reported = $(element).find('td:eq(2) span').text().trim();
            const out_percentage = $(element).find('td:eq(3)').text().trim();

            mutual.holder = holder
            mutual.shares = shares
            mutual.date_reported = date_reported
            mutual.out_percentage = out_percentage

            asset.holders.mutual_holders.push(mutual)
        })



        res.json(asset);
    } catch (error) {
        console.log('An error occurred:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});