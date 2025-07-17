export async function getDolarValue() {
  try {
    const response = await fetch(
      'https://dolarapi.com/v1/ambito/dolares/oficial'
    );
    const data = await response.json();

    return data.venta;
  } catch (error) {
    console.error('Error getting dolar value', error);
    return 0;
  }
}
