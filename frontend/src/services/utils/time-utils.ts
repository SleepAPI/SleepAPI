import { MathUtils, type Time } from 'sleepapi-common'

class TimeUtilsImpl {
  public formatTime(seconds: number) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    const hoursString = String(hours).padStart(2, '0')
    const minutesString = String(minutes).padStart(2, '0')
    const secondsString = String(remainingSeconds).padStart(2, '0')

    return `${hoursString}:${minutesString}:${secondsString}`
  }

  // TODO: exists in backend, should move to common
  public prettifyTime(time: Time) {
    const hourString = String(time.hour).padStart(2, '0')
    const minuteString = String(time.minute).padStart(2, '0')
    const secondString = String(MathUtils.round(time.second, 0)).padStart(2, '0')

    return `${hourString}:${minuteString}:${secondString}`
  }
}

export const TimeUtils = new TimeUtilsImpl()
