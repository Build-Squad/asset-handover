export const isValidFlowAddress = (address) => {
    if (!address.startsWith("0x") || address.length !== 18) {
        return false
    }
    return true
}

export const convertDate = (timeStamp) => {
    const date = new Date(timeStamp);

    const day = date.getDate().toString().padStart(2, '0');
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const formattedDate = `${month}-${day}-${year}`;

    return formattedDate;
}