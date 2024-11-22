export const getGenderName = (gender: string) => {
    if (gender === 'M') {
        return 'Male';
    } else if (gender === 'F') {
        return 'Female';
    }
    return 'Unknown';
}