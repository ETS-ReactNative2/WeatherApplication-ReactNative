import React, {useState, useEffect, useCallback} from 'react'
import { View, Text, FlatList, StyleSheet, RefreshControl} from 'react-native'
import axios from 'axios'
import DayWeather from '../components/DayWeather';
import { LinearGradient } from 'expo-linear-gradient';

const DayForecast = ({navigation, route}) => {
    const [timezone , setTimezone] = useState(0);
    const [daily, setDaily] = useState(null);
    const [error, setError] = useState(null)
    const [appIsReady, setAppIsReady] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false)

    const getDay = (value) => {
        const days = ["Monday" , "Tuesday" , "Wednesday" , "Thursday" , "Friday" , "Saturday" , "Sunday"];
        return days[value];
    }
    
    const initFetch = () => {
        (async () => {
            axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${route.params.lat}&lon=${route.params.lon}&exclude=current,minutely,hourly,alerts&appid=affd0627e677b629d379eb014262f11c`)
            .then(response => {
                setTimezone(response.data.timezone_offset);
                setDaily(response.data.daily);
            }).catch(err => {
                setError(err);
            }).finally(()=>{
                setIsRefreshing(false)
            })
        })();
    }

    useEffect(() => {
        setDaily(route.params.data);
    }, []);

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        initFetch()
      }, []);

    const onLayoutRootView = useCallback(() => {
        navigation.setOptions({
            title: route.params.name
        })
      }, []);

    return (
        <LinearGradient colors={['rgb(47, 99,147)', 'white']}
        style={{backgroundColor: 'rgb(47, 99,147)'}}>
            <FlatList 
            onLayout={onLayoutRootView}
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['rgb(47, 99,147)']}/>
              }
            contentContainerStyle={Styles.listContainer}
            data={daily}
            keyExtractor={item => item.dt}
            renderItem={({item}) => {
                console.log(item)
                return(
                    <>
                    <View style={Styles.dailyContainer}>
                        <CachedImage source = {{uri : `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}} style = {{ width: 40, height: 40 }}/>
                        <Text style={Styles.dayText}>{getDay(new Date(data.dt*1000-(info.timezone_offset*1000)).getDay())} - {data.weather[0].main}</Text>
                        <Text style={[Styles.dayText,{marginLeft: 'auto'}]}>{Math.round(data.temp.max - 273.15)}&deg;&nbsp;&#47;&nbsp;{Math.round(data.temp.min - 273.15)}&deg;</Text>
                    </View>
                    </>
                )
            }}
            />
        </LinearGradient>
    )
}

const Styles = StyleSheet.create({

})

export default DayForecast
