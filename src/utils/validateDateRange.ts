const isFinishDateGreaterThanStartDate = (date1: string, date2: string) => {
    const startDate = new Date(date1);
    const finishDate = new Date(date2);

    return finishDate >= startDate
}

export const validateDateRange = (startDate: string, finishDate: string) => {
    if (startDate && finishDate && !isFinishDateGreaterThanStartDate(startDate, finishDate))
        throw Error(' Finish date must be greater than start date');
}