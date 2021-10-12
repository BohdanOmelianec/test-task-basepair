import React from 'react';
import { LineChart, Line, XAxis, CartesianGrid, YAxis, Tooltip } from 'recharts';
import Spinner from './spinner/Spinner';

import './App.scss';

class App extends React.Component {
  state = {
    data: [],
    loading: true
  }

  apiKey = 'LW15KDPWT4NF50TB';
  symbols = [
    {name: 'Tesco London', symbol: 'TSCO.LON'},
    {name: 'IBM', symbol: 'IBM'},
    {name: 'Shopify Inc', symbol: 'SHOP.TRT'},
    {name: 'GreenPower Motor Company Inc', symbol: 'GPV.TRV'},
    {name: 'Daimler AG', symbol: 'DAI.DEX'},
    {name: 'Reliance Industries Limited', symbol: 'RELIANCE.BSE'},
    {name: 'SAIC Motor Corporation', symbol: '600104.SHH'},
    {name: 'China Vanke Company Ltd', symbol: '000002.SHZ'}
    ]

  componentDidMount() {
    this.getAllData();
  }

  renderLineChart = (data) => {
    return (
        <LineChart width={380} height={180} data={data}>
            <Line type="monotone" dataKey="close" stroke="#8884d8" dot={false} />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
        </LineChart>
    )
  };

  getData = async (url) => {
    let res = await fetch(url);

        if(!res.ok) {
            throw new Error(`Could not fetch ${url} status: ${res.status}`);
        }

        return res.json();
  }

  getAllData = () => {
    const requests = this.symbols.map(async item => {
        return {
            name: item.name,
            responce: await this.getData(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${item.symbol}&outputsize=compact&apikey=${this.apiKey}`)
        }
    })
    Promise.all(requests)
        .then(res => res.map(item => this.getValues(item)))
        .then(res => this.dataLoaded(res))
  }

  getValues = (object) => {
    const arr = [];
    const name = object.name;
    for(let key in object.responce['Time Series (Daily)']) {
        arr.push({
            'name': name, 
            'day': key.slice(-2),
            'close': object.responce['Time Series (Daily)'][key]["4. close"] 
        })
    }
    return arr;
  }
  
  dataLoaded = (data) => {
    this.setState({
        data,
        loading: false
    })
  }

  renderItems = (data) => {
    const items = data.map((item, i) => {
      item.reverse();

      return (
        <div className='list__item' key={i}>
          <div className='list__img'>
          {
            this.renderLineChart(item)
          }
          </div>
          <div className='list__company'>{item[0] ? item[0].name : 'Company name'}</div>
        </div>
      )
    });
    
    return (
      <div className='app__list'>
        {items}
      </div>
    );
  }

  render() {
    const {data, loading} = this.state;
    const items = this.renderItems(data);

    const load = loading ? <Spinner /> : null;
    const content = !loading ? items : null;

    return (
      <React.Fragment>
        <div className='app'>
          <div className='app__content'>
            <div className='app__title'>
              <h4>Tech</h4>
            </div>
            
              {load}
              {content}
            
          </div>
        </div>
      </React.Fragment>
    );
  }
}


export default App;
