export const calculateAge = (DOB: Date): number => {
    const today: Date = new Date();
    const birthDate: Date = new Date(DOB);
    
    // Ensure both values are of type 'number' before performing the arithmetic operation
    const ageDiff: number = today.getTime() - birthDate.getTime();
    const calculatedAge: number = Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
    
    return calculatedAge;
  };
  