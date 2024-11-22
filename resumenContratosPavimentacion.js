console.log('Iniciando script...');


//FUNCIONAMIENTO PRÁCTICO EN EDICIÓN: 
// CAMPOS COMPLETOS Y SE LE DA CLIC A AÑADIR MEZCLA
// => ESTO GENERA UNA TABLA COMO PREVISUALIZACION DE LA INFORMACIÓN. SIN EMBARGO NO VA A AÑADIR COSTOS ADICIONALES
// => PARA ESTO, SE LE DA A AÑADIR COSTO EN LA RESPECTIVA COLUMNA
// => A CONTINUACIÓN, SE ACTUALIZAN LOS VALORES DE LA TABLA
// NOTA: SI SE REQUIERE AÑADIR MÁS COSTOS ADICIONALES (NO HAY LÍMITE)
//  => SIMPLEMENTE SE DIGITA EN EL CAMPO CORRESPONDIENTE Y SE PRESIONA EL BOTÓN DE LA COLUMNA

var mezclaJsonObj = [];
//OCULTAR JSON
document.querySelector("[data-input='estructuraCostosTabla1Json']").style.display = 'none';



window.onload = function () {
    console.log('Página cargada.');
    // Obtener el JSON inicial
    document.querySelector("[data-input='valorTotalContrato']").style.display='none';
    const mezclaJson = document.querySelector("[data-input='estructuraCostosTabla1Json']").value;
    mezclaJsonObj = mezclaJson ? JSON.parse(mezclaJson) : [];

    // Vincular eventos a los botones
    const botonAnadirMezcla = document.querySelector("[data-td-label='anadirMezclaButton'] button");
    const botonAnadirCosto = document.querySelector("[data-div-label='anadirOtroCostoButton'] button");

    if (botonAnadirMezcla) {
        botonAnadirMezcla.addEventListener('click', function (event) {
            event.preventDefault();
            agregarCampos();
        });
    } else {
        console.error("El botón 'Añadir mezcla' no se encontró.");
    }

  // NUEVA FUNCIONALIDAD: Procesar JSON inicial y asociar eventos
    procesarTablaJson();
    // Generar la tabla inicial
    crearTabla();


};

// NUEVA FUNCIÓN: Procesar JSON inicial y asociar eventos
function procesarTablaJson() {
    var estructuraCostosTabla1Json = document.querySelector("[data-input='estructuraCostosTabla1Json']").value;

    if (!estructuraCostosTabla1Json) {
        estructuraCostosTabla1Json = [];
    } else {
        estructuraCostosTabla1Json = JSON.parse(estructuraCostosTabla1Json);
    }

    try {
        document.getElementById("JkrgObjectsCreatergForm").onsubmit = function (event) {
            crearTabla();
        };
    } catch (error) {
        console.log('Error durante ejecución onsubmit: ' + error);
    }

    // if (document.getElementById("JkrgObjectsCreatergForm") !== null) {
    //     console.log('En creación');
    //     document.querySelector("[data-td-label='estructuraCostosTabla1Json']").style.display = "none";
    // } else {
    //     console.log('En edición');
    //     document.querySelector("[data-td-label='estructuraCostosTabla1Json']").style.display = "none";
    // }
}

// Función para agregar registros de mezcla
function agregarCampos() {
    // Obtener valores de los campos
    const itemMezcla = document.querySelector('[data-input="itemMezcla"]').value;
    const itemTransporte = document.querySelector('[data-input="itemTransporte"]').value;
    const equiposItem = document.querySelector('[data-input="equiposItem"]').value;
    const itemMO = document.querySelector('[data-input="itemMO"]').value;
    const cantidadesContractualesInputSubtotalXItem = document.querySelector('[data-input="cantidadesContractualesInputSubtotalXItem"]').value;

    // Validación de campos
    if (!itemMezcla || !itemTransporte || !equiposItem || !itemMO || !cantidadesContractualesInputSubtotalXItem) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    const numericRegex = /^[0-9]+$/;
    if (![itemMezcla, itemTransporte, equiposItem, itemMO, cantidadesContractualesInputSubtotalXItem].every(val => numericRegex.test(val))) {
        alert("Todos los valores deben ser numéricos.");
        return;
    }

    // Crear el nuevo objeto con costos vacíos
    const nuevoItem = {
        mezcla: parseFloat(itemMezcla),
        transporte: parseFloat(itemTransporte),
        equipos: parseFloat(equiposItem),
        mo: parseFloat(itemMO),
        cantidadesContractualesInputSubtotalXItem: parseFloat(cantidadesContractualesInputSubtotalXItem),
        costos: [] // Inicializar la lista de costos vacía
    };

    // Agregar al JSON y actualizar el campo oculto
    mezclaJsonObj.push(nuevoItem);
    document.querySelector("[data-input='estructuraCostosTabla1Json']").value = JSON.stringify(mezclaJsonObj);

    // Limpiar los campos
    document.querySelector('[data-input="itemMezcla"]').value = '';
    document.querySelector('[data-input="itemTransporte"]').value = '';
    document.querySelector('[data-input="equiposItem"]').value = '';
    document.querySelector('[data-input="itemMO"]').value = '';
    document.querySelector('[data-input="cantidadesContractualesInputSubtotalXItem"]').value = '';

    // Regenerar la tabla con los valores actualizados
    crearTabla();
}

// Función para agregar un costo adicional a un registro específico
function agregarCostoExtra(index) {
    const costo = document.querySelector('[data-input="itemCosto"]').value;

    // Validar si el costo no está vacío
    if (!costo) {
        alert("El campo 'Costo' está vacío.");
        return;
    }

    // Asegurarse de que el costo sea un número
    if (!/^[0-9]+(\.[0-9]+)?$/.test(costo)) {
        alert("El valor del costo debe ser un número.");
        return;
    }

    // Agregar el nuevo costo al array de costos del registro correspondiente
    mezclaJsonObj[index].costos.push(parseFloat(costo));

    // Limpiar el campo de costo para permitir nuevos registros
    document.querySelector('[data-input="itemCosto"]').value = '';

    // Regenerar la tabla con los valores actualizados
    crearTabla();
}

// Función para calcular el SUBTOTAL SUELTO, TOTAL COMPACTO, POLIZAS, MARGEN, y los demás valores
function calcularValores() {
    return mezclaJsonObj.map(item => {
        // SUBTOTAL SUELTO
        const subtotalSuelto = item.mezcla + item.transporte + item.equipos + item.mo + item.costos.reduce((acc, costo) => acc + costo, 0);

        // TOTAL COMPACTO
        const totalCompacto = subtotalSuelto * 1.25;

        // POLIZAS
        const polizas = (totalCompacto * 1.08) * 0.01; // Se calcula el 1% de 108% de TOTAL COMPACTO

        // MARGEN
        const margen = (850000 - totalCompacto - polizas) / 850000;

        // SUBTOTAL POR ITEM
        const subtotalPorItem = 850000 * item.cantidadesContractualesInputSubtotalXItem;


        return {
            ...item,
            subtotalSuelto,
            totalCompacto,
            polizas,
            margen,
            subtotalPorItem
        };
    });
}

// Función para crear la tabla con filas y columnas dinámicas
function crearTabla() {
    const tablaContainer = document.querySelector("[data-div-label='estructuraCostos']");
    if (!tablaContainer) {
        console.error("El contenedor de la tabla no se encontró.");
        return;
    }

    if (mezclaJsonObj.length === 0) {
        tablaContainer.innerHTML = "<p>No hay datos para mostrar.</p>";
        return;
    }

    const valoresCalculados = calcularValores();

    // Crear la estructura básica de la tabla
    let tablaHTML = `
    <table border="1" style="border-collapse: collapse; table-layout: auto; text-align: center;">
        <thead>
            <tr style="max-width:200px">
                <th>Campo</th>
                ${valoresCalculados.map((_, index) => `<th>Registro ${index + 1}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Mezcla</td>
                ${valoresCalculados.map(item => `<td>${(item.mezcla).toLocaleString('es-CO')}</td>`).join('')}
            </tr>
            <tr>
                <td>Transporte</td>
                ${valoresCalculados.map(item => `<td>${(item.transporte).toLocaleString('es-CO')}</td>`).join('')}
            </tr>
            <tr>
                <td>Equipos</td>
                ${valoresCalculados.map(item => `<td>${(item.equipos).toLocaleString('es-CO')}</td>`).join('')}
            </tr>
            <tr>
                <td>M.O</td>
                ${valoresCalculados.map(item => `<td>${(item.mo).toLocaleString('es-CO')}</td>`).join('')}
            </tr>
            <tr>
                <td>Costo</td>
                ${valoresCalculados.map((item, index) => `
                    <td>
                        ${item.costos.length > 0 ? (item.costos.join(', ')).toLocaleString('es-CO') : '-'}
                        <button style="background-color: #4caf50; color: white; padding: 10px 20px; font-size: 16px; font-family: Arial, sans-serif; border: none; border-radius: 5px; cursor: pointer; transition: background-color 0.3s ease;" onclick="agregarCostoExtra(${index})">Añadir Costo</button>
                    </td>
                `).join('')}
            </tr>
            <tr>
                <td>SUBTOTAL SUELTO</td>
                ${valoresCalculados.map(item => `<td>${(item.subtotalSuelto).toLocaleString('es-CO')}</td>`).join('')}
            </tr>
            <tr>
                <td>TOTAL COMPACTO</td>
                ${valoresCalculados.map(item => `<td>${(item.totalCompacto).toLocaleString('es-CO')}</td>`).join('')}
            </tr>
            <tr>
                <td>POLIZAS</td>
                ${valoresCalculados.map(item => `<td>${(item.polizas).toLocaleString('es-CO')}</td>`).join('')}
            </tr>
            <tr>
                <td>MARGEN</td>
                ${valoresCalculados.map(item => `<td>${(Math.round(item.margen * 100, 2)).toLocaleString('es-CO')}%</td>`).join('')}
            </tr>
            <tr>
                <td colspan="${valoresCalculados.length}" style="text-align:center"><strong>P.U CONTRACTUALES</strong></td>
                <td>$ 850000</td>
            </tr>
            <!-- Fila de TOTAL CONTRATO -->
            <tr>
                <td colspan="${valoresCalculados.length}" style="text-align:center"><strong>TOTAL CONTRATO</strong></td>
                <td>${(valoresCalculados.reduce((acc, item) => acc + item.subtotalPorItem, 0)).toLocaleString('es-CO')}</td>
            </tr>
            <tr>
                <td>CANTIDADES CONTRACTUALES</td>
                ${valoresCalculados.map(item => `<td>${(item.cantidadesContractualesInputSubtotalXItem).toLocaleString('es-CO')}</td>`).join('')}
            </tr>
            <tr>
                <td>SUBTOTAL POR ITEM</td>
                ${valoresCalculados.map(item => `<td>${(item.subtotalPorItem).toLocaleString('es-CO')}</td>`).join('')}
            </tr>
            <!-- Fila de MARGEN ($) -->
            <tr>
                <td colspan="${valoresCalculados.length}" style="text-align:center"><strong>$ MARGEN</strong></td>
                <td>${(valoresCalculados.reduce((acc, item) => acc + (item.cantidadesContractualesInputSubtotalXItem * 850000 * item.margen), 0)).toLocaleString('es-CO')}</td>
            </tr>
            <!-- Fila de COSTOS ADICIONALES ($) -->
            <tr>
                <td colspan="${valoresCalculados.length}" style="text-align:center"><strong>$ COSTOS ADICIONALES</strong></td>
                <td>${(valoresCalculados.reduce((acc, item) => acc + (item.costos.reduce((acc, costo) => acc + costo, 0) * item.cantidadesContractualesInputSubtotalXItem), 0)).toLocaleString('es-CO')}</td>
            </tr>
            <!-- Fila de POLIZAS ($) -->
            <tr>
                <td colspan="${valoresCalculados.length}" style="text-align:center"><strong>$ POLIZAS</strong></td>
                <td>${(valoresCalculados.reduce((acc, item) => acc + (item.polizas * item.cantidadesContractualesInputSubtotalXItem), 0)).toLocaleString('es-CO')}</td>
            </tr>
        </tbody>
    </table>
`;


    tablaContainer.innerHTML = tablaHTML;
    // !!!!!!!!!!!!!!!!
    // ESTA LÍNEA PERMITE MOSTRAR LA TABLA EN VISUALIZACIÓN
    document.querySelector('[data-input="estructuraCostos"]').value = tablaHTML; 
}
