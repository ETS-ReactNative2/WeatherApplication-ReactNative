import React from 'react'
import { StyleSheet , View, Text, ScrollView, Dimensions , Image} from 'react-native'
import { useEffect, useState } from 'react'
import axios from 'axios'

const DailyForecast = (props) => {
    const [info , setInfo] = useState("");
    const [daily, setDaily] = useState([]);
    const [error, setError] = useState(null)
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const getDay = (value) => {
        const days = ["Monday" , "Tuesday" , "Wednesday" , "Thursday" , "Friday" , "Saturday" , "Sunday"];
        return days[value];
    
    }

    useEffect(() => {
        (async () => {
            axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${props.route.params.lat}&lon=${props.route.params.lon}&exclude=current,minutely,hourly&appid=affd0627e677b629d379eb014262f11c`)
            .then(response => {
                setInfo(response.data);
                setDaily(response.data.daily);
                setWeather(response.data.daily.weather);
            }).catch(err => {
                setError(err);
            })
            setIsLoading(false)
        })();
    }, [])
    return (
        <View style={styles.view}>
            <ScrollView style = {styles.scrollContainer}>
                {daily.map(data => (
                    <>
                    <View style = {styles.container}>
                        <View>
                            <Text style = {styles.day_name}>{getDay(new Date(data.dt*1000-(info.timezone_offset*1000)).getDay())}</Text>
                            <Text style = {styles.feels_like_label}>Feels like</Text>
                            <View style={styles.feels_like}>
                                <Text style={styles.day}>Day : {Math.trunc(data.feels_like.day - 273.15)} °C</Text>
                                <Text style={styles.night}>Night : {Math.trunc(data.feels_like.night - 273.15)} °C</Text>
                            </View>
                        </View>
                        <View>
                            {data.weather.map(w => (
                                <Image source = {{uri : `http://openweathermap.org/img/wn/${w.icon}@2x.png`}} style = {{ width: 100, height: 100 }}/>
                            ))}
                            
                        </View>
                    </View>
                    </>
                ))}
            </ScrollView>
        </View>
        
    )
}

const styles = StyleSheet.create({
    view:{
        width:Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor:"skyblue",
        padding: 30,
    },

    scrollContainer:{
        width:Dimensions.get('window').width - 60,
        marginLeft: 'auto',
        marginRight: 'auto',
        
    },

    container : {
        flex: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding : 10,
        marginBottom : 5,
        borderWidth : 2,
        borderColor: 'black',
        backgroundColor : 'grey',
    },

    day_name:{
        fontSize: 30,
        textAlign: 'center',
        color : 'white',
    },

    feels_like_label : {
        textAlign: 'center',
        color : 'white',
    },

    feels_like:{
        alignItems : 'center',
        justifyContent : 'center',
        flex: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding : 2,
    },

    day: {
        width : Dimensions.get('window').width / 4,
        textAlign: 'center',
        color : 'white',
    },

    night: {
        width : Dimensions.get('window').width / 4,
        textAlign: 'center',
        color : 'white',
    }


  });
  

export default DailyForecast;
