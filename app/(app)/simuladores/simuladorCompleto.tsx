import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; // useRouter para navegação imperativa (opcional)
import { getItem } from '@/context/AuthContext';
const DETALHES_KEY = 'detalhe-produto'; // Nova chave para armazenar o PRODUTO
const CADASTRO_KEY = 'user-cadastro'; // Nova chave para armazenar o CADASTRO
import { formatCurrency, PensionData,UserDetails } from '../../(app)/index';
import PercentageSelector from '@/components/PercentageSelector';
import { Feather } from '@expo/vector-icons';
import TimeSeriesChart from '@/components/TimeSeriesChart';
import CurrencyInput from '@/components/CurrencyInput';
const API_CALCULO_BASE_URL = 'https://calculadoraprev.vercel.app/api/';

// Interface para os dados de entrada (pode ser importada ou redefinida aqui)
interface FinancialData {
  mesAno: string;
  idadeCliente: number;
  saldoInicial: number;
  beneficioBruto: number;
  beneficioPago: number;
  juros: number;
  saldoFinal: number;
}

// Interface para dados de projecao
interface ProjecaoResults {
  projecao: ProjecaoItem[];
  motivoTermino: ProjecaoMotivoTermino;
}
interface ProjecaoItem {
  mesAno: string;
  idadeCliente: number;
  saldoInicial: number,
  beneficioBruto: number,
  beneficioPago: number,
  juros: number,
  saldoFinal: number
}
interface ProjecaoMotivoTermino {
  mesAno: string;
  idadeCliente: number;
}

// Seus dados (exemplo) - Certifique-se de que correspondem à interface FinancialData
const seusDadosFinanceiros: FinancialData[] = [
  {
    "mesAno": "04/2025",
    "idadeCliente": 72,
    "saldoInicial": 2157541.67,
    "beneficioBruto": 43150.83,
    "beneficioPago": 43150.83,
    "juros": 7769.98,
    "saldoFinal": 2122160.82
},
{
    "mesAno": "05/2025",
    "idadeCliente": 72,
    "saldoInicial": 2122160.82,
    "beneficioBruto": 43150.83,
    "beneficioPago": 43150.83,
    "juros": 7639.97,
    "saldoFinal": 2086649.96
},
{
    "mesAno": "06/2025",
    "idadeCliente": 72,
    "saldoInicial": 2086649.96,
    "beneficioBruto": 43150.83,
    "beneficioPago": 43150.83,
    "juros": 7509.47,
    "saldoFinal": 2051008.6
},
{
    "mesAno": "07/2025",
    "idadeCliente": 73,
    "saldoInicial": 2051008.6,
    "beneficioBruto": 43150.83,
    "beneficioPago": 43150.83,
    "juros": 7378.5,
    "saldoFinal": 2015236.27
},
{
    "mesAno": "08/2025",
    "idadeCliente": 73,
    "saldoInicial": 2015236.27,
    "beneficioBruto": 43150.83,
    "beneficioPago": 43150.83,
    "juros": 7247.04,
    "saldoFinal": 1979332.48
},
{
    "mesAno": "09/2025",
    "idadeCliente": 73,
    "saldoInicial": 1979332.48,
    "beneficioBruto": 43150.83,
    "beneficioPago": 43150.83,
    "juros": 7115.1,
    "saldoFinal": 1943296.75
},
{
    "mesAno": "10/2025",
    "idadeCliente": 73,
    "saldoInicial": 1943296.75,
    "beneficioBruto": 43150.83,
    "beneficioPago": 43150.83,
    "juros": 6982.68,
    "saldoFinal": 1907128.6
},
{
    "mesAno": "11/2025",
    "idadeCliente": 73,
    "saldoInicial": 1907128.6,
    "beneficioBruto": 43150.83,
    "beneficioPago": 43150.83,
    "juros": 6849.76,
    "saldoFinal": 1870827.53
},
{
    "mesAno": "12/2025",
    "idadeCliente": 73,
    "saldoInicial": 1870827.53,
    "beneficioBruto": 43150.83,
    "beneficioPago": 86301.67,
    "juros": 6557.79,
    "saldoFinal": 1791083.65
},
{
    "mesAno": "01/2026",
    "idadeCliente": 73,
    "saldoInicial": 1791083.65,
    "beneficioBruto": 35821.67,
    "beneficioPago": 35821.67,
    "juros": 6450.25,
    "saldoFinal": 1761712.23
},
{
    "mesAno": "02/2026",
    "idadeCliente": 73,
    "saldoInicial": 1761712.23,
    "beneficioBruto": 35821.67,
    "beneficioPago": 35821.67,
    "juros": 6342.32,
    "saldoFinal": 1732232.88
},
{
    "mesAno": "03/2026",
    "idadeCliente": 73,
    "saldoInicial": 1732232.88,
    "beneficioBruto": 35821.67,
    "beneficioPago": 35821.67,
    "juros": 6233.99,
    "saldoFinal": 1702645.2
},
{
    "mesAno": "04/2026",
    "idadeCliente": 73,
    "saldoInicial": 1702645.2,
    "beneficioBruto": 35821.67,
    "beneficioPago": 35821.67,
    "juros": 6125.26,
    "saldoFinal": 1672948.79
},
{
    "mesAno": "05/2026",
    "idadeCliente": 73,
    "saldoInicial": 1672948.79,
    "beneficioBruto": 35821.67,
    "beneficioPago": 35821.67,
    "juros": 6016.13,
    "saldoFinal": 1643143.25
},
{
    "mesAno": "06/2026",
    "idadeCliente": 73,
    "saldoInicial": 1643143.25,
    "beneficioBruto": 35821.67,
    "beneficioPago": 35821.67,
    "juros": 5906.6,
    "saldoFinal": 1613228.18
},
{
    "mesAno": "07/2026",
    "idadeCliente": 74,
    "saldoInicial": 1613228.18,
    "beneficioBruto": 35821.67,
    "beneficioPago": 35821.67,
    "juros": 5796.67,
    "saldoFinal": 1583203.18
},
{
    "mesAno": "08/2026",
    "idadeCliente": 74,
    "saldoInicial": 1583203.18,
    "beneficioBruto": 35821.67,
    "beneficioPago": 35821.67,
    "juros": 5686.33,
    "saldoFinal": 1553067.84
},
{
    "mesAno": "09/2026",
    "idadeCliente": 74,
    "saldoInicial": 1553067.84,
    "beneficioBruto": 35821.67,
    "beneficioPago": 35821.67,
    "juros": 5575.59,
    "saldoFinal": 1522821.76
},
{
    "mesAno": "10/2026",
    "idadeCliente": 74,
    "saldoInicial": 1522821.76,
    "beneficioBruto": 35821.67,
    "beneficioPago": 35821.67,
    "juros": 5464.44,
    "saldoFinal": 1492464.53
},
{
    "mesAno": "11/2026",
    "idadeCliente": 74,
    "saldoInicial": 1492464.53,
    "beneficioBruto": 35821.67,
    "beneficioPago": 35821.67,
    "juros": 5352.89,
    "saldoFinal": 1461995.75
},
{
    "mesAno": "12/2026",
    "idadeCliente": 74,
    "saldoInicial": 1461995.75,
    "beneficioBruto": 35821.67,
    "beneficioPago": 71643.35,
    "juros": 5109.28,
    "saldoFinal": 1395461.68
},
{
    "mesAno": "01/2027",
    "idadeCliente": 74,
    "saldoInicial": 1395461.68,
    "beneficioBruto": 27909.23,
    "beneficioPago": 27909.23,
    "juros": 5025.5,
    "saldoFinal": 1372577.95
},
{
    "mesAno": "02/2027",
    "idadeCliente": 74,
    "saldoInicial": 1372577.95,
    "beneficioBruto": 27909.23,
    "beneficioPago": 27909.23,
    "juros": 4941.4,
    "saldoFinal": 1349610.12
},
{
    "mesAno": "03/2027",
    "idadeCliente": 74,
    "saldoInicial": 1349610.12,
    "beneficioBruto": 27909.23,
    "beneficioPago": 27909.23,
    "juros": 4857,
    "saldoFinal": 1326557.89
},
{
    "mesAno": "04/2027",
    "idadeCliente": 74,
    "saldoInicial": 1326557.89,
    "beneficioBruto": 27909.23,
    "beneficioPago": 27909.23,
    "juros": 4772.29,
    "saldoFinal": 1303420.95
},
{
    "mesAno": "05/2027",
    "idadeCliente": 74,
    "saldoInicial": 1303420.95,
    "beneficioBruto": 27909.23,
    "beneficioPago": 27909.23,
    "juros": 4687.26,
    "saldoFinal": 1280198.98
},
{
    "mesAno": "06/2027",
    "idadeCliente": 74,
    "saldoInicial": 1280198.98,
    "beneficioBruto": 27909.23,
    "beneficioPago": 27909.23,
    "juros": 4601.93,
    "saldoFinal": 1256891.68
},
{
    "mesAno": "07/2027",
    "idadeCliente": 75,
    "saldoInicial": 1256891.68,
    "beneficioBruto": 27909.23,
    "beneficioPago": 27909.23,
    "juros": 4516.28,
    "saldoFinal": 1233498.73
},
{
    "mesAno": "08/2027",
    "idadeCliente": 75,
    "saldoInicial": 1233498.73,
    "beneficioBruto": 27909.23,
    "beneficioPago": 27909.23,
    "juros": 4430.31,
    "saldoFinal": 1210019.81
},
{
    "mesAno": "09/2027",
    "idadeCliente": 75,
    "saldoInicial": 1210019.81,
    "beneficioBruto": 27909.23,
    "beneficioPago": 27909.23,
    "juros": 4344.03,
    "saldoFinal": 1186454.61
},
{
    "mesAno": "10/2027",
    "idadeCliente": 75,
    "saldoInicial": 1186454.61,
    "beneficioBruto": 27909.23,
    "beneficioPago": 27909.23,
    "juros": 4257.43,
    "saldoFinal": 1162802.81
},
{
    "mesAno": "11/2027",
    "idadeCliente": 75,
    "saldoInicial": 1162802.81,
    "beneficioBruto": 27909.23,
    "beneficioPago": 27909.23,
    "juros": 4170.52,
    "saldoFinal": 1139064.1
},
{
    "mesAno": "12/2027",
    "idadeCliente": 75,
    "saldoInicial": 1139064.1,
    "beneficioBruto": 27909.23,
    "beneficioPago": 55818.47,
    "juros": 3980.72,
    "saldoFinal": 1087226.35
},
{
    "mesAno": "01/2028",
    "idadeCliente": 75,
    "saldoInicial": 1087226.35,
    "beneficioBruto": 21744.53,
    "beneficioPago": 21744.53,
    "juros": 3915.44,
    "saldoFinal": 1069397.26
},
{
    "mesAno": "02/2028",
    "idadeCliente": 75,
    "saldoInicial": 1069397.26,
    "beneficioBruto": 21744.53,
    "beneficioPago": 21744.53,
    "juros": 3849.92,
    "saldoFinal": 1051502.65
},
{
    "mesAno": "03/2028",
    "idadeCliente": 75,
    "saldoInicial": 1051502.65,
    "beneficioBruto": 21744.53,
    "beneficioPago": 21744.53,
    "juros": 3784.17,
    "saldoFinal": 1033542.29
},
{
    "mesAno": "04/2028",
    "idadeCliente": 75,
    "saldoInicial": 1033542.29,
    "beneficioBruto": 21744.53,
    "beneficioPago": 21744.53,
    "juros": 3718.16,
    "saldoFinal": 1015515.92
},
{
    "mesAno": "05/2028",
    "idadeCliente": 75,
    "saldoInicial": 1015515.92,
    "beneficioBruto": 21744.53,
    "beneficioPago": 21744.53,
    "juros": 3651.92,
    "saldoFinal": 997423.31
},
{
    "mesAno": "06/2028",
    "idadeCliente": 75,
    "saldoInicial": 997423.31,
    "beneficioBruto": 21744.53,
    "beneficioPago": 21744.53,
    "juros": 3585.43,
    "saldoFinal": 979264.22
},
{
    "mesAno": "07/2028",
    "idadeCliente": 76,
    "saldoInicial": 979264.22,
    "beneficioBruto": 21744.53,
    "beneficioPago": 21744.53,
    "juros": 3518.7,
    "saldoFinal": 961038.4
},
{
    "mesAno": "08/2028",
    "idadeCliente": 76,
    "saldoInicial": 961038.4,
    "beneficioBruto": 21744.53,
    "beneficioPago": 21744.53,
    "juros": 3451.73,
    "saldoFinal": 942745.6
},
{
    "mesAno": "09/2028",
    "idadeCliente": 76,
    "saldoInicial": 942745.6,
    "beneficioBruto": 21744.53,
    "beneficioPago": 21744.53,
    "juros": 3384.5,
    "saldoFinal": 924385.57
},
{
    "mesAno": "10/2028",
    "idadeCliente": 76,
    "saldoInicial": 924385.57,
    "beneficioBruto": 21744.53,
    "beneficioPago": 21744.53,
    "juros": 3317.03,
    "saldoFinal": 905958.08
},
{
    "mesAno": "11/2028",
    "idadeCliente": 76,
    "saldoInicial": 905958.08,
    "beneficioBruto": 21744.53,
    "beneficioPago": 21744.53,
    "juros": 3249.32,
    "saldoFinal": 887462.87
},
{
    "mesAno": "12/2028",
    "idadeCliente": 76,
    "saldoInicial": 887462.87,
    "beneficioBruto": 21744.53,
    "beneficioPago": 43489.05,
    "juros": 3101.44,
    "saldoFinal": 847075.26
},
{
    "mesAno": "01/2029",
    "idadeCliente": 76,
    "saldoInicial": 847075.26,
    "beneficioBruto": 16941.51,
    "beneficioPago": 16941.51,
    "juros": 3050.58,
    "saldoFinal": 833184.34
},
{
    "mesAno": "02/2029",
    "idadeCliente": 76,
    "saldoInicial": 833184.34,
    "beneficioBruto": 16941.51,
    "beneficioPago": 16941.51,
    "juros": 2999.54,
    "saldoFinal": 819242.37
},
{
    "mesAno": "03/2029",
    "idadeCliente": 76,
    "saldoInicial": 819242.37,
    "beneficioBruto": 16941.51,
    "beneficioPago": 16941.51,
    "juros": 2948.3,
    "saldoFinal": 805249.17
},
{
    "mesAno": "04/2029",
    "idadeCliente": 76,
    "saldoInicial": 805249.17,
    "beneficioBruto": 16941.51,
    "beneficioPago": 16941.51,
    "juros": 2896.88,
    "saldoFinal": 791204.55
},
{
    "mesAno": "05/2029",
    "idadeCliente": 76,
    "saldoInicial": 791204.55,
    "beneficioBruto": 16941.51,
    "beneficioPago": 16941.51,
    "juros": 2845.27,
    "saldoFinal": 777108.31
},
{
    "mesAno": "06/2029",
    "idadeCliente": 76,
    "saldoInicial": 777108.31,
    "beneficioBruto": 16941.51,
    "beneficioPago": 16941.51,
    "juros": 2793.47,
    "saldoFinal": 762960.27
},
{
    "mesAno": "07/2029",
    "idadeCliente": 77,
    "saldoInicial": 762960.27,
    "beneficioBruto": 16941.51,
    "beneficioPago": 16941.51,
    "juros": 2741.48,
    "saldoFinal": 748760.25
},
{
    "mesAno": "08/2029",
    "idadeCliente": 77,
    "saldoInicial": 748760.25,
    "beneficioBruto": 16941.51,
    "beneficioPago": 16941.51,
    "juros": 2689.29,
    "saldoFinal": 734508.04
},
{
    "mesAno": "09/2029",
    "idadeCliente": 77,
    "saldoInicial": 734508.04,
    "beneficioBruto": 16941.51,
    "beneficioPago": 16941.51,
    "juros": 2636.92,
    "saldoFinal": 720203.45
},
{
    "mesAno": "10/2029",
    "idadeCliente": 77,
    "saldoInicial": 720203.45,
    "beneficioBruto": 16941.51,
    "beneficioPago": 16941.51,
    "juros": 2584.35,
    "saldoFinal": 705846.3
},
{
    "mesAno": "11/2029",
    "idadeCliente": 77,
    "saldoInicial": 705846.3,
    "beneficioBruto": 16941.51,
    "beneficioPago": 16941.51,
    "juros": 2531.59,
    "saldoFinal": 691436.39
},
{
    "mesAno": "12/2029",
    "idadeCliente": 77,
    "saldoInicial": 691436.39,
    "beneficioBruto": 16941.51,
    "beneficioPago": 33883.01,
    "juros": 2416.38,
    "saldoFinal": 659969.76
},
{
    "mesAno": "01/2030",
    "idadeCliente": 77,
    "saldoInicial": 659969.76,
    "beneficioBruto": 13199.4,
    "beneficioPago": 13199.4,
    "juros": 2376.76,
    "saldoFinal": 649147.13
},
{
    "mesAno": "02/2030",
    "idadeCliente": 77,
    "saldoInicial": 649147.13,
    "beneficioBruto": 13199.4,
    "beneficioPago": 13199.4,
    "juros": 2336.99,
    "saldoFinal": 638284.72
},
{
    "mesAno": "03/2030",
    "idadeCliente": 77,
    "saldoInicial": 638284.72,
    "beneficioBruto": 13199.4,
    "beneficioPago": 13199.4,
    "juros": 2297.07,
    "saldoFinal": 627382.39
},
{
    "mesAno": "04/2030",
    "idadeCliente": 77,
    "saldoInicial": 627382.39,
    "beneficioBruto": 13199.4,
    "beneficioPago": 13199.4,
    "juros": 2257.01,
    "saldoFinal": 616440.01
},
{
    "mesAno": "05/2030",
    "idadeCliente": 77,
    "saldoInicial": 616440.01,
    "beneficioBruto": 13199.4,
    "beneficioPago": 13199.4,
    "juros": 2216.79,
    "saldoFinal": 605457.41
},
{
    "mesAno": "06/2030",
    "idadeCliente": 77,
    "saldoInicial": 605457.41,
    "beneficioBruto": 13199.4,
    "beneficioPago": 13199.4,
    "juros": 2176.44,
    "saldoFinal": 594434.45
},
{
    "mesAno": "07/2030",
    "idadeCliente": 78,
    "saldoInicial": 594434.45,
    "beneficioBruto": 13199.4,
    "beneficioPago": 13199.4,
    "juros": 2135.93,
    "saldoFinal": 583370.98
},
{
    "mesAno": "08/2030",
    "idadeCliente": 78,
    "saldoInicial": 583370.98,
    "beneficioBruto": 13199.4,
    "beneficioPago": 13199.4,
    "juros": 2095.27,
    "saldoFinal": 572266.86
},
{
    "mesAno": "09/2030",
    "idadeCliente": 78,
    "saldoInicial": 572266.86,
    "beneficioBruto": 13199.4,
    "beneficioPago": 13199.4,
    "juros": 2054.47,
    "saldoFinal": 561121.93
},
{
    "mesAno": "10/2030",
    "idadeCliente": 78,
    "saldoInicial": 561121.93,
    "beneficioBruto": 13199.4,
    "beneficioPago": 13199.4,
    "juros": 2013.51,
    "saldoFinal": 549936.04
},
{
    "mesAno": "11/2030",
    "idadeCliente": 78,
    "saldoInicial": 549936.04,
    "beneficioBruto": 13199.4,
    "beneficioPago": 13199.4,
    "juros": 1972.41,
    "saldoFinal": 538709.05
},
{
    "mesAno": "12/2030",
    "idadeCliente": 78,
    "saldoInicial": 538709.05,
    "beneficioBruto": 13199.4,
    "beneficioPago": 26398.79,
    "juros": 1882.64,
    "saldoFinal": 514192.91
},
{
    "mesAno": "01/2031",
    "idadeCliente": 78,
    "saldoInicial": 514192.91,
    "beneficioBruto": 10283.86,
    "beneficioPago": 10283.86,
    "juros": 1851.77,
    "saldoFinal": 505760.82
},
{
    "mesAno": "02/2031",
    "idadeCliente": 78,
    "saldoInicial": 505760.82,
    "beneficioBruto": 10283.86,
    "beneficioPago": 10283.86,
    "juros": 1820.78,
    "saldoFinal": 497297.74
},
{
    "mesAno": "03/2031",
    "idadeCliente": 78,
    "saldoInicial": 497297.74,
    "beneficioBruto": 10283.86,
    "beneficioPago": 10283.86,
    "juros": 1789.68,
    "saldoFinal": 488803.57
},
{
    "mesAno": "04/2031",
    "idadeCliente": 78,
    "saldoInicial": 488803.57,
    "beneficioBruto": 10283.86,
    "beneficioPago": 10283.86,
    "juros": 1758.47,
    "saldoFinal": 480278.18
},
{
    "mesAno": "05/2031",
    "idadeCliente": 78,
    "saldoInicial": 480278.18,
    "beneficioBruto": 10283.86,
    "beneficioPago": 10283.86,
    "juros": 1727.14,
    "saldoFinal": 471721.46
},
{
    "mesAno": "06/2031",
    "idadeCliente": 78,
    "saldoInicial": 471721.46,
    "beneficioBruto": 10283.86,
    "beneficioPago": 10283.86,
    "juros": 1695.7,
    "saldoFinal": 463133.3
},
{
    "mesAno": "07/2031",
    "idadeCliente": 79,
    "saldoInicial": 463133.3,
    "beneficioBruto": 10283.86,
    "beneficioPago": 10283.86,
    "juros": 1664.14,
    "saldoFinal": 454513.58
},
{
    "mesAno": "08/2031",
    "idadeCliente": 79,
    "saldoInicial": 454513.58,
    "beneficioBruto": 10283.86,
    "beneficioPago": 10283.86,
    "juros": 1632.46,
    "saldoFinal": 445862.18
},
{
    "mesAno": "09/2031",
    "idadeCliente": 79,
    "saldoInicial": 445862.18,
    "beneficioBruto": 10283.86,
    "beneficioPago": 10283.86,
    "juros": 1600.67,
    "saldoFinal": 437178.99
},
{
    "mesAno": "10/2031",
    "idadeCliente": 79,
    "saldoInicial": 437178.99,
    "beneficioBruto": 10283.86,
    "beneficioPago": 10283.86,
    "juros": 1568.76,
    "saldoFinal": 428463.89
},
{
    "mesAno": "11/2031",
    "idadeCliente": 79,
    "saldoInicial": 428463.89,
    "beneficioBruto": 10283.86,
    "beneficioPago": 10283.86,
    "juros": 1536.73,
    "saldoFinal": 419716.77
},
{
    "mesAno": "12/2031",
    "idadeCliente": 79,
    "saldoInicial": 419716.77,
    "beneficioBruto": 10283.86,
    "beneficioPago": 20567.72,
    "juros": 1466.8,
    "saldoFinal": 400615.85
},
{
    "mesAno": "01/2032",
    "idadeCliente": 79,
    "saldoInicial": 400615.85,
    "beneficioBruto": 8012.32,
    "beneficioPago": 8012.32,
    "juros": 1442.74,
    "saldoFinal": 394046.27
},
{
    "mesAno": "02/2032",
    "idadeCliente": 79,
    "saldoInicial": 394046.27,
    "beneficioBruto": 8012.32,
    "beneficioPago": 8012.32,
    "juros": 1418.6,
    "saldoFinal": 387452.56
},
{
    "mesAno": "03/2032",
    "idadeCliente": 79,
    "saldoInicial": 387452.56,
    "beneficioBruto": 8012.32,
    "beneficioPago": 8012.32,
    "juros": 1394.37,
    "saldoFinal": 380834.61
},
{
    "mesAno": "04/2032",
    "idadeCliente": 79,
    "saldoInicial": 380834.61,
    "beneficioBruto": 8012.32,
    "beneficioPago": 8012.32,
    "juros": 1370.05,
    "saldoFinal": 374192.35
},
{
    "mesAno": "05/2032",
    "idadeCliente": 79,
    "saldoInicial": 374192.35,
    "beneficioBruto": 8012.32,
    "beneficioPago": 8012.32,
    "juros": 1345.64,
    "saldoFinal": 367525.67
},
{
    "mesAno": "06/2032",
    "idadeCliente": 79,
    "saldoInicial": 367525.67,
    "beneficioBruto": 8012.32,
    "beneficioPago": 8012.32,
    "juros": 1321.14,
    "saldoFinal": 360834.5
},
{
    "mesAno": "07/2032",
    "idadeCliente": 80,
    "saldoInicial": 360834.5,
    "beneficioBruto": 8012.32,
    "beneficioPago": 8012.32,
    "juros": 1296.55,
    "saldoFinal": 354118.73
},
{
    "mesAno": "08/2032",
    "idadeCliente": 80,
    "saldoInicial": 354118.73,
    "beneficioBruto": 8012.32,
    "beneficioPago": 8012.32,
    "juros": 1271.88,
    "saldoFinal": 347378.29
},
{
    "mesAno": "09/2032",
    "idadeCliente": 80,
    "saldoInicial": 347378.29,
    "beneficioBruto": 8012.32,
    "beneficioPago": 8012.32,
    "juros": 1247.11,
    "saldoFinal": 340613.08
},
{
    "mesAno": "10/2032",
    "idadeCliente": 80,
    "saldoInicial": 340613.08,
    "beneficioBruto": 8012.32,
    "beneficioPago": 8012.32,
    "juros": 1222.24,
    "saldoFinal": 333823.01
},
{
    "mesAno": "11/2032",
    "idadeCliente": 80,
    "saldoInicial": 333823.01,
    "beneficioBruto": 8012.32,
    "beneficioPago": 8012.32,
    "juros": 1197.29,
    "saldoFinal": 327007.98
},
{
    "mesAno": "12/2032",
    "idadeCliente": 80,
    "saldoInicial": 327007.98,
    "beneficioBruto": 8012.32,
    "beneficioPago": 16024.63,
    "juros": 1142.8,
    "saldoFinal": 312126.15
},
{
    "mesAno": "01/2033",
    "idadeCliente": 80,
    "saldoInicial": 312126.15,
    "beneficioBruto": 6242.52,
    "beneficioPago": 6242.52,
    "juros": 1124.06,
    "saldoFinal": 307007.69
},
{
    "mesAno": "02/2033",
    "idadeCliente": 80,
    "saldoInicial": 307007.69,
    "beneficioBruto": 6242.52,
    "beneficioPago": 6242.52,
    "juros": 1105.25,
    "saldoFinal": 301870.43
},
{
    "mesAno": "03/2033",
    "idadeCliente": 80,
    "saldoInicial": 301870.43,
    "beneficioBruto": 6242.52,
    "beneficioPago": 6242.52,
    "juros": 1086.38,
    "saldoFinal": 296714.28
},
{
    "mesAno": "04/2033",
    "idadeCliente": 80,
    "saldoInicial": 296714.28,
    "beneficioBruto": 6242.52,
    "beneficioPago": 6242.52,
    "juros": 1067.43,
    "saldoFinal": 291539.19
},
{
    "mesAno": "05/2033",
    "idadeCliente": 80,
    "saldoInicial": 291539.19,
    "beneficioBruto": 6242.52,
    "beneficioPago": 6242.52,
    "juros": 1048.41,
    "saldoFinal": 286345.07
},
{
    "mesAno": "06/2033",
    "idadeCliente": 80,
    "saldoInicial": 286345.07,
    "beneficioBruto": 6242.52,
    "beneficioPago": 6242.52,
    "juros": 1029.32,
    "saldoFinal": 281131.87
},
{
    "mesAno": "07/2033",
    "idadeCliente": 81,
    "saldoInicial": 281131.87,
    "beneficioBruto": 6242.52,
    "beneficioPago": 6242.52,
    "juros": 1010.17,
    "saldoFinal": 275899.52
},
{
    "mesAno": "08/2033",
    "idadeCliente": 81,
    "saldoInicial": 275899.52,
    "beneficioBruto": 6242.52,
    "beneficioPago": 6242.52,
    "juros": 990.94,
    "saldoFinal": 270647.93
},
{
    "mesAno": "09/2033",
    "idadeCliente": 81,
    "saldoInicial": 270647.93,
    "beneficioBruto": 6242.52,
    "beneficioPago": 6242.52,
    "juros": 971.64,
    "saldoFinal": 265377.05
},
{
    "mesAno": "10/2033",
    "idadeCliente": 81,
    "saldoInicial": 265377.05,
    "beneficioBruto": 6242.52,
    "beneficioPago": 6242.52,
    "juros": 952.27,
    "saldoFinal": 260086.8
},
{
    "mesAno": "11/2033",
    "idadeCliente": 81,
    "saldoInicial": 260086.8,
    "beneficioBruto": 6242.52,
    "beneficioPago": 6242.52,
    "juros": 932.83,
    "saldoFinal": 254777.1
},
{
    "mesAno": "12/2033",
    "idadeCliente": 81,
    "saldoInicial": 254777.1,
    "beneficioBruto": 6242.52,
    "beneficioPago": 12485.05,
    "juros": 890.38,
    "saldoFinal": 243182.43
},
{
    "mesAno": "01/2034",
    "idadeCliente": 81,
    "saldoInicial": 243182.43,
    "beneficioBruto": 4863.65,
    "beneficioPago": 4863.65,
    "juros": 875.78,
    "saldoFinal": 239194.56
},
{
    "mesAno": "02/2034",
    "idadeCliente": 81,
    "saldoInicial": 239194.56,
    "beneficioBruto": 4863.65,
    "beneficioPago": 4863.65,
    "juros": 861.12,
    "saldoFinal": 235192.03
},
{
    "mesAno": "03/2034",
    "idadeCliente": 81,
    "saldoInicial": 235192.03,
    "beneficioBruto": 4863.65,
    "beneficioPago": 4863.65,
    "juros": 846.41,
    "saldoFinal": 231174.8
},
{
    "mesAno": "04/2034",
    "idadeCliente": 81,
    "saldoInicial": 231174.8,
    "beneficioBruto": 4863.65,
    "beneficioPago": 4863.65,
    "juros": 831.65,
    "saldoFinal": 227142.8
},
{
    "mesAno": "05/2034",
    "idadeCliente": 81,
    "saldoInicial": 227142.8,
    "beneficioBruto": 4863.65,
    "beneficioPago": 4863.65,
    "juros": 816.83,
    "saldoFinal": 223095.98
},
{
    "mesAno": "06/2034",
    "idadeCliente": 81,
    "saldoInicial": 223095.98,
    "beneficioBruto": 4863.65,
    "beneficioPago": 4863.65,
    "juros": 801.96,
    "saldoFinal": 219034.3
},
{
    "mesAno": "07/2034",
    "idadeCliente": 82,
    "saldoInicial": 219034.3,
    "beneficioBruto": 4863.65,
    "beneficioPago": 4863.65,
    "juros": 787.04,
    "saldoFinal": 214957.68
},
{
    "mesAno": "08/2034",
    "idadeCliente": 82,
    "saldoInicial": 214957.68,
    "beneficioBruto": 4863.65,
    "beneficioPago": 4863.65,
    "juros": 772.06,
    "saldoFinal": 210866.09
},
{
    "mesAno": "09/2034",
    "idadeCliente": 82,
    "saldoInicial": 210866.09,
    "beneficioBruto": 4863.65,
    "beneficioPago": 4863.65,
    "juros": 757.02,
    "saldoFinal": 206759.46
},
{
    "mesAno": "10/2034",
    "idadeCliente": 82,
    "saldoInicial": 206759.46,
    "beneficioBruto": 4863.65,
    "beneficioPago": 4863.65,
    "juros": 741.93,
    "saldoFinal": 202637.74
},
{
    "mesAno": "11/2034",
    "idadeCliente": 82,
    "saldoInicial": 202637.74,
    "beneficioBruto": 4863.65,
    "beneficioPago": 4863.65,
    "juros": 726.78,
    "saldoFinal": 198500.87
},
{
    "mesAno": "12/2034",
    "idadeCliente": 82,
    "saldoInicial": 198500.87,
    "beneficioBruto": 4863.65,
    "beneficioPago": 9727.3,
    "juros": 693.71,
    "saldoFinal": 189467.28
},
{
    "mesAno": "01/2035",
    "idadeCliente": 82,
    "saldoInicial": 189467.28,
    "beneficioBruto": 3789.35,
    "beneficioPago": 3789.35,
    "juros": 682.33,
    "saldoFinal": 186360.27
},
{
    "mesAno": "02/2035",
    "idadeCliente": 82,
    "saldoInicial": 186360.27,
    "beneficioBruto": 3789.35,
    "beneficioPago": 3789.35,
    "juros": 670.91,
    "saldoFinal": 183241.84
},
{
    "mesAno": "03/2035",
    "idadeCliente": 82,
    "saldoInicial": 183241.84,
    "beneficioBruto": 3789.35,
    "beneficioPago": 3789.35,
    "juros": 659.45,
    "saldoFinal": 180111.94
},
{
    "mesAno": "04/2035",
    "idadeCliente": 82,
    "saldoInicial": 180111.94,
    "beneficioBruto": 3789.35,
    "beneficioPago": 3789.35,
    "juros": 647.95,
    "saldoFinal": 176970.55
},
{
    "mesAno": "05/2035",
    "idadeCliente": 82,
    "saldoInicial": 176970.55,
    "beneficioBruto": 3789.35,
    "beneficioPago": 3789.35,
    "juros": 636.41,
    "saldoFinal": 173817.61
},
{
    "mesAno": "06/2035",
    "idadeCliente": 82,
    "saldoInicial": 173817.61,
    "beneficioBruto": 3789.35,
    "beneficioPago": 3789.35,
    "juros": 624.82,
    "saldoFinal": 170653.09
},
{
    "mesAno": "07/2035",
    "idadeCliente": 83,
    "saldoInicial": 170653.09,
    "beneficioBruto": 3789.35,
    "beneficioPago": 3789.35,
    "juros": 613.19,
    "saldoFinal": 167476.94
},
{
    "mesAno": "08/2035",
    "idadeCliente": 83,
    "saldoInicial": 167476.94,
    "beneficioBruto": 3789.35,
    "beneficioPago": 3789.35,
    "juros": 601.52,
    "saldoFinal": 164289.11
},
{
    "mesAno": "09/2035",
    "idadeCliente": 83,
    "saldoInicial": 164289.11,
    "beneficioBruto": 3789.35,
    "beneficioPago": 3789.35,
    "juros": 589.81,
    "saldoFinal": 161089.57
},
{
    "mesAno": "10/2035",
    "idadeCliente": 83,
    "saldoInicial": 161089.57,
    "beneficioBruto": 3789.35,
    "beneficioPago": 3789.35,
    "juros": 578.05,
    "saldoFinal": 157878.27
},
{
    "mesAno": "11/2035",
    "idadeCliente": 83,
    "saldoInicial": 157878.27,
    "beneficioBruto": 3789.35,
    "beneficioPago": 3789.35,
    "juros": 566.25,
    "saldoFinal": 154655.17
},
{
    "mesAno": "12/2035",
    "idadeCliente": 83,
    "saldoInicial": 154655.17,
    "beneficioBruto": 3789.35,
    "beneficioPago": 7578.69,
    "juros": 540.48,
    "saldoFinal": 147616.96
},
{
    "mesAno": "01/2036",
    "idadeCliente": 83,
    "saldoInicial": 147616.96,
    "beneficioBruto": 2952.34,
    "beneficioPago": 2952.34,
    "juros": 531.62,
    "saldoFinal": 145196.24
},
{
    "mesAno": "02/2036",
    "idadeCliente": 83,
    "saldoInicial": 145196.24,
    "beneficioBruto": 2952.34,
    "beneficioPago": 2952.34,
    "juros": 522.72,
    "saldoFinal": 142766.62
},
{
    "mesAno": "03/2036",
    "idadeCliente": 83,
    "saldoInicial": 142766.62,
    "beneficioBruto": 2952.34,
    "beneficioPago": 2952.34,
    "juros": 513.79,
    "saldoFinal": 140328.07
},
{
    "mesAno": "04/2036",
    "idadeCliente": 83,
    "saldoInicial": 140328.07,
    "beneficioBruto": 2952.34,
    "beneficioPago": 2952.34,
    "juros": 504.83,
    "saldoFinal": 137880.56
},
{
    "mesAno": "05/2036",
    "idadeCliente": 83,
    "saldoInicial": 137880.56,
    "beneficioBruto": 2952.34,
    "beneficioPago": 2952.34,
    "juros": 495.84,
    "saldoFinal": 135424.06
},
{
    "mesAno": "06/2036",
    "idadeCliente": 83,
    "saldoInicial": 135424.06,
    "beneficioBruto": 2952.34,
    "beneficioPago": 2952.34,
    "juros": 486.81,
    "saldoFinal": 132958.53
},
{
    "mesAno": "07/2036",
    "idadeCliente": 84,
    "saldoInicial": 132958.53,
    "beneficioBruto": 2952.34,
    "beneficioPago": 2952.34,
    "juros": 477.75,
    "saldoFinal": 130483.94
},
{
    "mesAno": "08/2036",
    "idadeCliente": 84,
    "saldoInicial": 130483.94,
    "beneficioBruto": 2952.34,
    "beneficioPago": 2952.34,
    "juros": 468.65,
    "saldoFinal": 128000.25
},
{
    "mesAno": "09/2036",
    "idadeCliente": 84,
    "saldoInicial": 128000.25,
    "beneficioBruto": 2952.34,
    "beneficioPago": 2952.34,
    "juros": 459.53,
    "saldoFinal": 125507.44
},
{
    "mesAno": "10/2036",
    "idadeCliente": 84,
    "saldoInicial": 125507.44,
    "beneficioBruto": 2952.34,
    "beneficioPago": 2952.34,
    "juros": 450.37,
    "saldoFinal": 123005.47
},
{
    "mesAno": "11/2036",
    "idadeCliente": 84,
    "saldoInicial": 123005.47,
    "beneficioBruto": 2952.34,
    "beneficioPago": 2952.34,
    "juros": 441.17,
    "saldoFinal": 120494.3
},
{
    "mesAno": "12/2036",
    "idadeCliente": 84,
    "saldoInicial": 120494.3,
    "beneficioBruto": 2952.34,
    "beneficioPago": 5904.68,
    "juros": 421.1,
    "saldoFinal": 115010.72
},
{
    "mesAno": "01/2037",
    "idadeCliente": 84,
    "saldoInicial": 115010.72,
    "beneficioBruto": 2300.21,
    "beneficioPago": 2300.21,
    "juros": 414.19,
    "saldoFinal": 113124.69
},
{
    "mesAno": "02/2037",
    "idadeCliente": 84,
    "saldoInicial": 113124.69,
    "beneficioBruto": 2300.21,
    "beneficioPago": 2300.21,
    "juros": 407.26,
    "saldoFinal": 111231.74
},
{
    "mesAno": "03/2037",
    "idadeCliente": 84,
    "saldoInicial": 111231.74,
    "beneficioBruto": 2300.21,
    "beneficioPago": 2300.21,
    "juros": 400.3,
    "saldoFinal": 109331.83
},
{
    "mesAno": "04/2037",
    "idadeCliente": 84,
    "saldoInicial": 109331.83,
    "beneficioBruto": 2300.21,
    "beneficioPago": 2300.21,
    "juros": 393.32,
    "saldoFinal": 107424.93
},
{
    "mesAno": "05/2037",
    "idadeCliente": 84,
    "saldoInicial": 107424.93,
    "beneficioBruto": 2300.21,
    "beneficioPago": 2300.21,
    "juros": 386.31,
    "saldoFinal": 105511.03
},
{
    "mesAno": "06/2037",
    "idadeCliente": 84,
    "saldoInicial": 105511.03,
    "beneficioBruto": 2300.21,
    "beneficioPago": 2300.21,
    "juros": 379.28,
    "saldoFinal": 103590.1
},
{
    "mesAno": "07/2037",
    "idadeCliente": 85,
    "saldoInicial": 103590.1,
    "beneficioBruto": 2300.21,
    "beneficioPago": 2300.21,
    "juros": 372.22,
    "saldoFinal": 101662.11
},
{
    "mesAno": "08/2037",
    "idadeCliente": 85,
    "saldoInicial": 101662.11,
    "beneficioBruto": 2300.21,
    "beneficioPago": 2300.21,
    "juros": 365.14,
    "saldoFinal": 99727.03
},
{
    "mesAno": "09/2037",
    "idadeCliente": 85,
    "saldoInicial": 99727.03,
    "beneficioBruto": 2300.21,
    "beneficioPago": 2300.21,
    "juros": 358.03,
    "saldoFinal": 97784.84
},
{
    "mesAno": "10/2037",
    "idadeCliente": 85,
    "saldoInicial": 97784.84,
    "beneficioBruto": 2300.21,
    "beneficioPago": 2300.21,
    "juros": 350.89,
    "saldoFinal": 95835.51
},
{
    "mesAno": "11/2037",
    "idadeCliente": 85,
    "saldoInicial": 95835.51,
    "beneficioBruto": 2300.21,
    "beneficioPago": 2300.21,
    "juros": 343.72,
    "saldoFinal": 93879.02
},
{
    "mesAno": "12/2037",
    "idadeCliente": 85,
    "saldoInicial": 93879.02,
    "beneficioBruto": 2300.21,
    "beneficioPago": 4600.43,
    "juros": 328.08,
    "saldoFinal": 89606.67
},
{
    "mesAno": "01/2038",
    "idadeCliente": 85,
    "saldoInicial": 89606.67,
    "beneficioBruto": 1792.13,
    "beneficioPago": 1792.13,
    "juros": 322.7,
    "saldoFinal": 88137.24
},
{
    "mesAno": "02/2038",
    "idadeCliente": 85,
    "saldoInicial": 88137.24,
    "beneficioBruto": 1792.13,
    "beneficioPago": 1792.13,
    "juros": 317.3,
    "saldoFinal": 86662.41
},
{
    "mesAno": "03/2038",
    "idadeCliente": 85,
    "saldoInicial": 86662.41,
    "beneficioBruto": 1792.13,
    "beneficioPago": 1792.13,
    "juros": 311.88,
    "saldoFinal": 85182.16
},
{
    "mesAno": "04/2038",
    "idadeCliente": 85,
    "saldoInicial": 85182.16,
    "beneficioBruto": 1792.13,
    "beneficioPago": 1792.13,
    "juros": 306.44,
    "saldoFinal": 83696.47
},
{
    "mesAno": "05/2038",
    "idadeCliente": 85,
    "saldoInicial": 83696.47,
    "beneficioBruto": 1792.13,
    "beneficioPago": 1792.13,
    "juros": 300.98,
    "saldoFinal": 82205.32
},
{
    "mesAno": "06/2038",
    "idadeCliente": 85,
    "saldoInicial": 82205.32,
    "beneficioBruto": 1792.13,
    "beneficioPago": 1792.13,
    "juros": 295.5,
    "saldoFinal": 80708.69
},
{
    "mesAno": "07/2038",
    "idadeCliente": 86,
    "saldoInicial": 80708.69,
    "beneficioBruto": 1792.13,
    "beneficioPago": 1792.13,
    "juros": 290,
    "saldoFinal": 79206.56
},
{
    "mesAno": "08/2038",
    "idadeCliente": 86,
    "saldoInicial": 79206.56,
    "beneficioBruto": 1792.13,
    "beneficioPago": 1792.13,
    "juros": 284.48,
    "saldoFinal": 77698.91
},
{
    "mesAno": "09/2038",
    "idadeCliente": 86,
    "saldoInicial": 77698.91,
    "beneficioBruto": 1792.13,
    "beneficioPago": 1792.13,
    "juros": 278.94,
    "saldoFinal": 76185.72
},
{
    "mesAno": "10/2038",
    "idadeCliente": 86,
    "saldoInicial": 76185.72,
    "beneficioBruto": 1792.13,
    "beneficioPago": 1792.13,
    "juros": 273.38,
    "saldoFinal": 74666.97
},
{
    "mesAno": "11/2038",
    "idadeCliente": 86,
    "saldoInicial": 74666.97,
    "beneficioBruto": 1792.13,
    "beneficioPago": 1792.13,
    "juros": 267.8,
    "saldoFinal": 73142.63
},
{
    "mesAno": "12/2038",
    "idadeCliente": 86,
    "saldoInicial": 73142.63,
    "beneficioBruto": 1792.13,
    "beneficioPago": 3584.27,
    "juros": 255.61,
    "saldoFinal": 69813.98
},
{
    "mesAno": "01/2039",
    "idadeCliente": 86,
    "saldoInicial": 69813.98,
    "beneficioBruto": 1396.28,
    "beneficioPago": 1396.28,
    "juros": 251.42,
    "saldoFinal": 68669.12
},
{
    "mesAno": "02/2039",
    "idadeCliente": 86,
    "saldoInicial": 68669.12,
    "beneficioBruto": 1396.28,
    "beneficioPago": 1396.28,
    "juros": 247.21,
    "saldoFinal": 67520.06
},
{
    "mesAno": "03/2039",
    "idadeCliente": 86,
    "saldoInicial": 67520.06,
    "beneficioBruto": 1396.28,
    "beneficioPago": 1396.28,
    "juros": 242.99,
    "saldoFinal": 66366.77
},
{
    "mesAno": "04/2039",
    "idadeCliente": 86,
    "saldoInicial": 66366.77,
    "beneficioBruto": 1396.28,
    "beneficioPago": 1396.28,
    "juros": 238.75,
    "saldoFinal": 65209.25
},
{
    "mesAno": "05/2039",
    "idadeCliente": 86,
    "saldoInicial": 65209.25,
    "beneficioBruto": 1396.28,
    "beneficioPago": 1396.28,
    "juros": 234.5,
    "saldoFinal": 64047.47
},
{
    "mesAno": "06/2039",
    "idadeCliente": 86,
    "saldoInicial": 64047.47,
    "beneficioBruto": 1396.28,
    "beneficioPago": 1396.28,
    "juros": 230.23,
    "saldoFinal": 62881.42
},
{
    "mesAno": "07/2039",
    "idadeCliente": 87,
    "saldoInicial": 62881.42,
    "beneficioBruto": 1396.28,
    "beneficioPago": 1396.28,
    "juros": 225.95,
    "saldoFinal": 61711.08
},
{
    "mesAno": "08/2039",
    "idadeCliente": 87,
    "saldoInicial": 61711.08,
    "beneficioBruto": 1396.28,
    "beneficioPago": 1396.28,
    "juros": 221.65,
    "saldoFinal": 60536.45
},
{
    "mesAno": "09/2039",
    "idadeCliente": 87,
    "saldoInicial": 60536.45,
    "beneficioBruto": 1396.28,
    "beneficioPago": 1396.28,
    "juros": 217.33,
    "saldoFinal": 59357.5
},
{
    "mesAno": "10/2039",
    "idadeCliente": 87,
    "saldoInicial": 59357.5,
    "beneficioBruto": 1396.28,
    "beneficioPago": 1396.28,
    "juros": 213,
    "saldoFinal": 58174.22
},
{
    "mesAno": "11/2039",
    "idadeCliente": 87,
    "saldoInicial": 58174.22,
    "beneficioBruto": 1396.28,
    "beneficioPago": 1396.28,
    "juros": 208.65,
    "saldoFinal": 56986.58
},
{
    "mesAno": "12/2039",
    "idadeCliente": 87,
    "saldoInicial": 56986.58,
    "beneficioBruto": 1396.28,
    "beneficioPago": 2792.56,
    "juros": 199.15,
    "saldoFinal": 54393.18
},
{
    "mesAno": "01/2040",
    "idadeCliente": 87,
    "saldoInicial": 54393.18,
    "beneficioBruto": 1087.86,
    "beneficioPago": 1087.86,
    "juros": 195.89,
    "saldoFinal": 53501.2
},
{
    "mesAno": "02/2040",
    "idadeCliente": 87,
    "saldoInicial": 53501.2,
    "beneficioBruto": 1087.86,
    "beneficioPago": 1087.86,
    "juros": 192.61,
    "saldoFinal": 52605.95
},
{
    "mesAno": "03/2040",
    "idadeCliente": 87,
    "saldoInicial": 52605.95,
    "beneficioBruto": 1087.86,
    "beneficioPago": 1087.86,
    "juros": 189.32,
    "saldoFinal": 51707.4
},
{
    "mesAno": "04/2040",
    "idadeCliente": 87,
    "saldoInicial": 51707.4,
    "beneficioBruto": 1087.86,
    "beneficioPago": 1087.86,
    "juros": 186.02,
    "saldoFinal": 50805.56
},
{
    "mesAno": "05/2040",
    "idadeCliente": 87,
    "saldoInicial": 50805.56,
    "beneficioBruto": 1087.86,
    "beneficioPago": 1087.86,
    "juros": 182.7,
    "saldoFinal": 49900.4
},
{
    "mesAno": "06/2040",
    "idadeCliente": 87,
    "saldoInicial": 49900.4,
    "beneficioBruto": 1087.86,
    "beneficioPago": 1087.86,
    "juros": 179.38,
    "saldoFinal": 48991.91
},
{
    "mesAno": "07/2040",
    "idadeCliente": 88,
    "saldoInicial": 48991.91,
    "beneficioBruto": 1087.86,
    "beneficioPago": 1087.86,
    "juros": 176.04,
    "saldoFinal": 48080.08
},
{
    "mesAno": "08/2040",
    "idadeCliente": 88,
    "saldoInicial": 48080.08,
    "beneficioBruto": 1087.86,
    "beneficioPago": 1087.86,
    "juros": 172.69,
    "saldoFinal": 47164.91
},
{
    "mesAno": "09/2040",
    "idadeCliente": 88,
    "saldoInicial": 47164.91,
    "beneficioBruto": 1087.86,
    "beneficioPago": 1087.86,
    "juros": 169.32,
    "saldoFinal": 46246.37
},
{
    "mesAno": "10/2040",
    "idadeCliente": 88,
    "saldoInicial": 46246.37,
    "beneficioBruto": 1087.86,
    "beneficioPago": 1087.86,
    "juros": 165.95,
    "saldoFinal": 45324.45
},
{
    "mesAno": "11/2040",
    "idadeCliente": 88,
    "saldoInicial": 45324.45,
    "beneficioBruto": 1087.86,
    "beneficioPago": 1087.86,
    "juros": 162.56,
    "saldoFinal": 44399.15
},
{
    "mesAno": "12/2040",
    "idadeCliente": 88,
    "saldoInicial": 44399.15,
    "beneficioBruto": 1087.86,
    "beneficioPago": 2175.73,
    "juros": 155.16,
    "saldoFinal": 42378.59
}
 ];

export default function SimuladorCompletoScreen() {
  const router = useRouter(); // Hook para navegação programática
  const [selectedPercentage, setSelectedPercentage] = useState<number>(1);
  const [selectedRentabilidade, setSelectedRentabilidade] = useState<number>(4.5);
  const [dadosDetalhe, setDadosDetalhe] = useState<PensionData | null>(null);
  const [dadosCadastro, setDadosCadastro] = useState<UserDetails | null>(null);
  const [dadosResultado, setDadosResultado] = useState<ProjecaoItem[] | null>(null);
  const [valorRenda, setValorRenda] = useState<number | undefined>(undefined);

  // Estado para indicar o carregamento
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Estado para armazenar possíveis erros
  const [error, setError] = useState<string | null>(null);

  const [results, setResults] = useState<boolean>(false);

  // useEffect para buscar os dados quando o componente montar
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true); // Inicia o carregamento
        setError(null); // Limpa erros anteriores

        // 1. Tenta buscar o item do Storage
        const storedDetalhesString = await getItem(DETALHES_KEY);

        // 2. Verifica se algo foi encontrado
        if (storedDetalhesString !== null) {
          // 3. Parseia a string JSON de volta para um objeto
          const parsedDetalhes = JSON.parse(storedDetalhesString);
          setDadosDetalhe(parsedDetalhes); // Atualiza o estado com os dados
        } else {
          // Se não encontrou nada, define um valor padrão ou mantém null
          console.log('Nenhum detalhe encontrado no Storage.');
          // setUserPrefs({ theme: 'light', notificationsEnabled: true }); // Exemplo de valor padrão
        }

        // 1. Tenta buscar o item do Storage
        const storedCadastroString = await getItem(CADASTRO_KEY);

        // 2. Verifica se algo foi encontrado
        if (storedCadastroString !== null) {
          // 3. Parseia a string JSON de volta para um objeto
          const parsedCadastro = JSON.parse(storedCadastroString);
          setDadosCadastro(parsedCadastro); // Atualiza o estado com os dados
        } else {
          // Se não encontrou nada, define um valor padrão ou mantém null
          console.log('Nenhum cadastro encontrado no Storage.');
          // setUserPrefs({ theme: 'light', notificationsEnabled: true }); // Exemplo de valor padrão
        }
      } catch (e: any) {
        // 4. Captura erros (leitura ou parse)
        console.error("Erro ao carregar dados do Storage:", e);
        setError("Falha ao carregar as preferências.");
      } finally {
        // 5. Finaliza o carregamento, independentemente de sucesso ou erro
        setIsLoading(false);
      }
    };

    loadData(); // Chama a função assíncrona

    // A função de cleanup não é estritamente necessária para getItem,
    // mas é bom saber que ela existe para operações mais complexas.
    // return () => { /* Código de limpeza, se necessário */ };
  }, []); // [] garante que o efeito rode apenas uma vez na montagem

  // Função que será passada para o CurrencyInput para receber o valor
  const handleValorChange = (novoValorCentavos: number | undefined) => {
    console.log('Valor numérico recebido (centavos):', novoValorCentavos);
    setValorRenda(novoValorCentavos);
  };

  const handleSubmit = async (): Promise<void> => { // Tipo de retorno void
    // Alert.alert('Formulário Enviado', `Percentual Selecionado: ${selectedPercentage}%` + `Rentabilidade: ${selectedRentabilidade}%`);
    setResults(true);
    // Lógica de envio do formulário aqui

    // Consulta projeção do Benefício com os dados do Simulador
    const objProjecaoRequest = {
      saldoAcumuladoInicial: dadosDetalhe?.saldo.valor,     // Envia o CPF sem espaços extras
      dataInicioBeneficio: new Date(),
      dataNascimentoCliente: dadosCadastro?.dataNascimento,
      percentualRentabilidadeAnual: selectedRentabilidade,
      saldoMinimo: 0,
      idadeMaxima: 110,
      tipoPagamento: 'PERCENTUAL_SALDO_ANUAL',
      parametroPagamento: selectedPercentage
    }
    const responseProjecao = await fetch(API_CALCULO_BASE_URL+'simular-evolucao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Indica que estamos enviando JSON
        'Accept': 'application/json',       // Indica que esperamos JSON de volta
      },
      body: JSON.stringify(objProjecaoRequest),
    });

    const responseBodyProjecao: ProjecaoResults = await responseProjecao.json(); // Tenta parsear o corpo como JSON
    setDadosResultado(responseBodyProjecao.projecao);
  };
  const handleClear = (): void => { // Tipo de retorno void
    setResults(false);
    // Lógica de envio do formulário aqui
  };

  // Função de callback tipada
  const handlePercentageChange = (value: number): void => {
    setSelectedPercentage(value);
  };
  // Função de callback tipada
  const handleRentabilidadeChange = (value: number): void => {
    setSelectedRentabilidade(value);
  };
  // --- Renderização Condicional ---
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Carregando dados...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro: {error}</Text>
      </View>
    );
  }
  return (
    // SafeAreaView é bom para evitar que o conteúdo fique sob notches/barras
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.formContainer}>
        {!results &&
          <View>
          <View style={styles.cardController}>
            <Text style={styles.saldo}>{formatCurrency(dadosDetalhe?.saldo.valor)}</Text>
          </View>
          <View style={styles.cardController}>
            <PercentageSelector
              label="Percentual do Saldo para Investir:"
              initialValue={selectedPercentage}
              onValueChange={handlePercentageChange}
              minValue={0}
              maxValue={2}
              step={0.01}
            />
          </View>
          {/* Componente CurrencyInput */}
          <CurrencyInput
            label="Valor em Reais"
            // initialValue={5000} // Ex: Para iniciar com R$ 50,00 (5000 centavos) - Opcional
            onChangeValue={handleValorChange} // Passa a função de callback
            placeholder="Digite o valor" // Você pode sobrescrever o placeholder padrão
            // style={{ backgroundColor: '#f5f5f5' }} // Exemplo de estilo customizado
          />

          <View style={styles.cardController}>
          <PercentageSelector
            label="Percentual de Rentabilidade:"
            initialValue={selectedRentabilidade}
            onValueChange={handleRentabilidadeChange}
            minValue={4.5}
            maxValue={6.5}
            step={0.1}
          />
          </View>
          <TouchableOpacity style={styles.simulateButton} onPress={handleSubmit} >
              <Text style={styles.buttonText}>Simular</Text>
              <Feather name="arrow-right"  size={22} color={'#fff'} />
          </TouchableOpacity>
        </View>
        }
        {
          results && <View>
            <Text>Resultados</Text>

            <TimeSeriesChart dataList={dadosResultado} />
            
            <TouchableOpacity style={styles.simulateButton} onPress={handleClear} >
                <Text style={styles.buttonText}>Voltar a simulação</Text>
            </TouchableOpacity>
          </View>
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ocupa toda a tela
  },
  formContainer: {
    flexGrow: 1, // Permite que o ScrollView cresça se necessário
    padding: 20,
    // justifyContent: 'center', // Centraliza se houver pouco conteúdo
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
  },
  cardController: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 20
  },
  saldo: {
    fontSize: 22,
    textAlign: 'center'
  },
    simulateButton: {
      backgroundColor: '#3C2E88',
      borderRadius: 8,
      paddingVertical: 14,
      marginTop: 15,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
  },
  buttonText: {
      color: '#ffffff',
      fontSize: 22,
      marginRight: 8, // Espaço antes do ícone
      fontFamily: 'Campton-Medium'
  },
});