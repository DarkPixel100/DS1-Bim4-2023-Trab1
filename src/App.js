import React, { useState, useEffect } from "react";
import style from "./App.module.css";
import logo from "./logo.png";
import loading from "./imgs/Loading.svg";
import icones from "./jsons/climas.json";

function Header() {
  return (
    <header>
      <img src={logo} className={style.AppLogo} alt="logo" />
      <h1>Clima</h1>
    </header>
  );
}

function SearchBox({ setQueryReq }) {
  return (
    <input
      type="search"
      className={style.SearchBox}
      placeholder="Nome da cidade..."
      onChange={(e) => {
        setQueryReq(e.target.value);
      }}
    />
  );
}

function SearchSelect({ queryRes, setLocation }) {
  return (
    <div className={style.CityList}>
      {queryRes.map((city, key) => (
        <p
          key={key}
          onClick={(e) => {
            e.target.parentElement.parentElement.children[0].value = "";
            setLocation(city);
          }}
        >
          {city.name}, {city.admin1}, {city.country_code}
        </p>
      ))}
    </div>
  );
}

function InfoDia({ previsao, dia }) {
  let date = new Date();
  date.setDate(date.getDate() + dia);
  const iso = date.toISOString();
  const day = iso.substring(0, 10);
  const hour = iso.replace(iso.slice(-10), "00");
  const dayKey = previsao.daily.time.indexOf(day);
  const hourKey = previsao.hourly.time.indexOf(hour);
  const turno = previsao.current.is_day ? "dia" : "noite";

  const code = previsao.hourly.weathercode[hourKey];

  return (
    <div id="MainInfo" className={turno=='noite'?style.noite:style.dia}>
      <img src={icones[code][turno].image} className={style.MainIcon} alt="" />
      <ul className={style.InfoDia}>
        <h3>{date.toDateString().split(" ").join(", ")}</h3>
        <li>
          <h2>{previsao.hourly.temperature_2m[hourKey]}°C</h2>
          <h3>{icones[code][turno].descricao}</h3>
          {previsao.daily.temperature_2m_max[dayKey]}°C /{" "}
          {previsao.daily.temperature_2m_min[dayKey]}°C - Sensação de{" "}
          {previsao.hourly.apparent_temperature[hourKey]}°C
        </li>
        <li>Umidade: {previsao.hourly.relativehumidity_2m[hourKey]}%</li>
        <li>
          Chance de chuva: {previsao.hourly.precipitation_probability[hourKey]}%
        </li>
      </ul>
    </div>
  );
}

function App() {
  const [isOnLoad, setIsOnload] = useState(true);
  const [queryReq, setQueryReq] = useState("");
  const [queryRes, setQueryRes] = useState([]);
  const [location, setLocation] = useState({});
  const [previsao, setPrevisao] = useState({});

  async function getLocalGeocodings(queryReq) {
    const req = queryReq.replace(/\s/g, "+");
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${req}&count=5&language=en&format=json`;
    const res = await fetch(url);
    const obj = await res.json();

    setQueryRes(obj.results);
  }

  async function getPrevisaoTempo(latitude, longitude) {
    setIsOnload(true);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=is_day&hourly=temperature_2m,precipitation_probability,relativehumidity_2m,weathercode,apparent_temperature&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=America%2FSao_Paulo&past_days=1&forecast_days=3`;
    const res = await fetch(url);
    const obj = await res.json();

    if (obj.current) {
      console.log(obj);
      setPrevisao(obj);
      setIsOnload(false);
    }
  }

  useEffect(() => {
    getLocalGeocodings(queryReq);
  }, [queryReq]);

  useEffect(() => {
    getPrevisaoTempo(location.latitude, location.longitude);
    setQueryRes();
  }, [location]);

  return (
    <div className={style.App}>
      <Header></Header>
      <main>
        <div className={style.Search}>
          <SearchBox setQueryReq={setQueryReq} setQueryRes={setQueryRes} />
          {queryRes ? (
            <SearchSelect queryRes={queryRes} setLocation={setLocation} />
          ) : null}
        </div>
        {isOnLoad ? (
          location.name ? (
            <img className={style.loading} src={loading} alt="" />
          ) : (
            <h3>Selecione uma cidade</h3>
          )
        ) : (
          <div className={style.Info}>
            <h2 className={style.Localidade}>
              {[location.name, ", ", location.admin1, " - ", location.country]}
            </h2>
            <div className={style.Dias}>
              <InfoDia previsao={previsao} dia={-1}></InfoDia>
              <InfoDia previsao={previsao} dia={0}></InfoDia>
              <InfoDia previsao={previsao} dia={1}></InfoDia>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
