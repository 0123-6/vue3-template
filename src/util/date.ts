import dayjs, {Dayjs} from "dayjs";

// 格式化时间
export const dateToYYYYMMDD = (date = new Date()) => {
	return dayjs(date).format('YYYY-MM-DD')
}

export const dateToYYYYMMDDHHMMSS = (date: (string | Date | Dayjs) = new Date()) => {
	return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// Element Plus日期快捷方式
// 快捷方式周和月
export const dateShortcutsWeekAndMonth = [
	{
		text: '最近一周',
		value: () => {
			const start = new Date()
			const end = new Date()
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
			return [start, end]
		},
	},
	{
		text: '最近一月',
		value: () => {
			const start = new Date()
			const end = new Date()
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
			return [start, end]
		},
	},
]

// 快捷方式周月年
export const dateShortcutsWeekAndMonthAndYear = [
	{
		text: '最近一周',
		value: () => {
			const start = new Date()
			const end = new Date()
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
			return [start, end]
		},
	},
	{
		text: '最近一月',
		value: () => {
			const start = new Date()
			const end = new Date()
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
			return [start, end]
		},
	},
	{
		text: '最近一年',
		value: () => {
			const start = new Date()
			const end = new Date()
			start.setTime(start.getTime() - 3600 * 1000 * 24 * 365)
			return [start, end]
		},
	},
]

// 遍历指定日期段
export const getDateInRange = (startDate, endDate) => {
	const start = dayjs(startDate)
	const end = dayjs(endDate)
	const dates = []

	let current = start
	while (current.isBefore(end) || current.isSame(end, 'day')) {
		// 格式化时间
		dates.push(current.format('YYYY-MM-DD'))
		current = current.add(1, 'day')
	}

	return dates
}

// 判断指定日期是否大于今天的日期
export const isAfterToday = date => {
	return dayjs(date).isAfter(dayjs(), 'day')
}

// 判断1个日期是否早于另一个日期
export const dateBeforeAnotherDate = (date1, date2) => {
	return dayjs(date1).isBefore(date2, 'day')
}

// 获取指定日期n天前的日期
export const getDateBeforeDay = (date, beforeDayNum) => {
	return dayjs(date).subtract(beforeDayNum, 'day')
}

// 获取指定日期n天后的日期
export const getDateAfterDay = (date, afterDayNum) => {
	return dayjs(date).add(afterDayNum, 'day')
}

// 设置时分秒
export const setHms = (date, hour, minute, second) => {
	return dayjs(date)
		.set('hour', hour)
		.set('minute', minute)
		.set('second', second)
}

// 获取当前日期的上1个月的第一天
export const getBeforeMonthFirstDate = (date) => {
	return dayjs(date).subtract(1, 'month').startOf('month')
}