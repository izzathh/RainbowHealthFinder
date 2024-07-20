import React, { useEffect, useState } from 'react';
import axios from 'axios'

const backendUrl = import.meta.env.VITE_BACKEND_URL;

import '../assets/css/reports.css';
import logo from "../assets/images/rainbowhealthfinder-header-logo.png"
import { saveAs } from 'file-saver';
import { useNavigate } from "react-router";
import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Box, Chip } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { eachDayOfInterval, format } from 'date-fns';
import { Logout, Description } from '@mui/icons-material';
import Swal from 'sweetalert2'
import Paginate from 'react-paginate';

const columnDataTable = [
    { id: 1, value: 'senderId', name: 'Sender Id' },
    { id: 2, value: 'date', name: 'Date' },
    { id: 3, value: 'avatarsName', name: 'Avatars Name' },
    { id: 4, value: 'gender', name: 'Gender' },
    { id: 5, value: 'birthSex', name: 'Birth Sex' },
    { id: 6, value: 'sexualOrientation', name: 'Sexual Orientation' },
    { id: 7, value: 'serviceType', name: 'Service Type' },
    { id: 8, value: 'populationDetails', name: 'Population Details' },
    { id: 9, value: 'costModel', name: 'Cost Model' },
    { id: 10, value: 'proximitySlot', name: 'Proximity Slot' },
    { id: 11, value: 'accuracyOfTheAdvice', name: 'Advice Accuracy' },
    { id: 12, value: 'accuracyOfTheConversation', name: 'Conversation Accuracy' },
    { id: 13, value: 'healthServicesProvided', name: 'Health Services Provided' },
    { id: 14, value: 'overallExperience', name: 'Overall Experience' },
    { id: 15, value: 'emailAddress', name: 'Email Address' },
    { id: 16, value: 'HowToImprove', name: 'How To Improve' },
];

const allDropDowns = [
    {
        options: [
            { title: "avatar-one" },
            { title: "avatar-two" },
            { title: "avatar-three" },
            { title: "avatar-four" },
            { title: "avatar-five" },
            { title: "avatar-six" }
        ],
        filterBy: "Filter By Avatar Name",
        value: "avatarsName"
    },
    {
        options: [
            { title: "Male" },
            { title: "Female" },
            { title: "Transgender Male" },
            { title: "Transgender Female" },
            { title: "Non-binary" },
            { title: "Sistergirl" },
            { title: "Brotherboy" },
            { title: "Genderqueer" },
            { title: "Genderfluid" },
            { title: "Still figuring it out" }
        ],
        filterBy: "Filter By Gender",
        value: "gender"
    },
    {
        options: [
            { title: "Male" },
            { title: "Female" },
            { title: "Prefer not to say" }
        ],
        filterBy: "Filter By Birth Sex",
        value: "birthSex"
    },
    {
        options: [
            { title: "Straight (Heterosexual)" },
            { title: "Gay or Lesbian (Homosexual)" },
            { title: "Bisexual" },
            { title: "Pansexual" },
            { title: "Queer" },
            { title: "Asexual" },
            { title: "Still figuring it out" },
            { title: "Prefer not to say" }
        ],
        filterBy: "Filter By Sexual Orientation",
        value: "sexualOrientation"
    },
    {
        options: [
            { title: "GP" },
            { title: "Gender Medicine" },
            { title: "Sexual Health" },
            { title: "Domestic, Financial and Sexual Violence" },
            { title: "Termination of Pregnancy" },
            { title: "Mental Health - Crisis" },
            { title: "General Support & Resources" },
            { title: "Mental Health - Psychologists" },
            { title: "PREP Prescribing" },
            { title: "PEP prescribing source" },
            { title: "Alcohol, Tabacco and Other Drugs" },
            { title: "Queer Women's Health" },
            { title: "Mental Health - Psychologists and Counsellors" }
        ],
        filterBy: "Filter By Service Type",
        value: "serviceType"
    },
    {
        options: [
            { title: "All" },
            { title: "Gender diverse" },
            { title: "People with a Uterus" },
            { title: "Young People" },
            { title: "First Nations Peoples" },
            { title: "Not Sure" }
        ],
        filterBy: "Filter By Population Details",
        value: "populationDetails"
    },
    {
        options: [
            { title: "Medicare Rebate with Gap" },
            { title: "Full Fee" },
            { title: "Public" },
            { title: "Unknown" },
            { title: "Not Sure" }
        ],
        filterBy: "Filter By Cost Model",
        value: "costModel"
    }
];

export const Reports = () => {
    const [filterText, setFilterText] = useState({});
    const [selectedOption, setSelectedOption] = useState(allDropDowns.map(() => "0"));
    const [userData, setUserData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [columnData, setColumnData] = useState([])
    const [mostGenderAndCount, setMostGenderAndCount] = useState('')
    const [mostCommonAvatarNameAndAvatar, setMostCommonAvatarNameAndAvatar] = useState('')
    const [mostCommonServiceAndCount, setMostCommonServiceAndCount] = useState('')
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [selectedValues, setSelectedValues] = useState([]);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        setColumnData(columnDataTable.map((data) => {
            return {
                name: data.name,
                selector: row => row[data.value],
                sortable: true,
            }
        }))
    }, [])

    useEffect(() => {
        const checkAuth = sessionStorage.getItem('adminLogged')
        if (checkAuth === 'yes') {
            const getUserData = async () => {
                try {
                    const { data } = await axios.get(`${backendUrl}/get-user-data`);
                    const indexAddedData = data.userData.map((item, index) => ({ id: index + 1, ...item }));
                    setUserData(indexAddedData)
                    setFilteredData(indexAddedData)
                    setMostGenderAndCount(`${data.mostCommonGender}&&${data.mostGenderCount}`)
                    setMostCommonAvatarNameAndAvatar(`${data.mostCommonAvatarName}&&${data.mostAvatarCount}`)
                    setMostCommonServiceAndCount(`${data.mostCommonServiceUsed}&&${data.countService}`)
                } catch (error) {
                    console.error('getUserData:', error);
                }
            }
            getUserData()
        } else {
            navigate("/admin-login")
            return
        }
    }, [])

    const handleLogout = () => {
        Swal.fire({
            title: "Are you sure you want to logout?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#a855f7",
            cancelButtonColor: "#d33",
            confirmButtonText: "Logout!"
        }).then((result) => {
            if (result.isConfirmed) {
                sessionStorage.setItem('adminLogged', 'no')
                window.location.reload()
            }
        });
    }

    const handleReportDownload = async () => {
        try {
            const tableColumns = columnDataTable.map(col => col.value);
            const filteredDataForExcel = filteredData.map(row => {
                const filteredRow = {};
                tableColumns.forEach(col => {
                    filteredRow[col] = row[col] !== undefined ? row[col] : '';
                });
                return filteredRow;
            });

            const response = await axios.post(`${backendUrl}/download-report-excel`,
                { data: filteredDataForExcel },
                {
                    responseType: 'blob',
                }
            );
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, 'user_report.xlsx');
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    };

    const handleViewAllData = () => {
        setFilteredData(userData)
        setFilterText({})
        setSelectedValues({});
        setFromDate(null);
        setToDate(null);
        setSelectedOption(allDropDowns.map(() => "0"))
    }

    const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected + 1);
    };

    const handleFilterChange = (event, dropdownIndex) => {
        const { value } = event.target;
        const updatedSelectedOption = [...selectedOption];
        updatedSelectedOption[dropdownIndex] = value;
        setSelectedOption(updatedSelectedOption);
        const selectedValuesCopy = { ...selectedValues };
        const dropdown = allDropDowns[dropdownIndex];
        selectedValuesCopy[dropdown.value] = value;
        setSelectedValues(selectedValuesCopy);
        applyFilters(selectedValuesCopy);
    };

    const applyFilters = (selectedValues) => {
        let filteredData = userData;
        Object.keys(selectedValues).forEach(key => {
            const value = selectedValues[key];
            if (value !== '0' && value !== undefined) {
                filteredData = filteredData.filter(item => item[key] === value);
            }
        });

        if (fromDate && toDate) {
            const start = new Date(fromDate).setHours(0, 0, 0, 0);
            const end = new Date(toDate).setHours(23, 59, 59, 999);
            filteredData = filteredData.filter(item => {
                const date = new Date(item.date).getTime();
                return date >= start && date <= end;
            });
        }

        setFilteredData(filteredData);
        setCurrentPage(1);
    };

    const paginateData = () => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredData.slice(startIndex, endIndex);
    };

    useEffect(() => {
        paginateData();
    }, [filteredData, currentPage]);

    const allSelected = Object.entries(selectedValues)
        .filter(([key]) => key !== 'date')
        .map(([, value]) => value)
        .flat();

    useEffect(() => {
        const filteredCurData = userData.filter(item => {
            return Object.entries(selectedValues).every(([key, values]) => {
                if (values.length === 0) return true;
                return values.includes(item[key]);
            });
        });
        setFilteredData(filteredCurData)
    }, [selectedValues])

    const handleFilterByDate = () => {
        if (fromDate && toDate) {
            const range = eachDayOfInterval({ start: fromDate, end: toDate });
            const formattedRange = range.map(date => format(date, 'yyyy-MM-dd'));
            setSelectedValues(prevValues => ({
                ...prevValues,
                date: formattedRange
            }));
            setCurrentPage(1);
        }
    };

    return (
        <div className='report-page'>
            <div className='reports-container'>
                <nav className='reports-page-header'>
                    <div className={`rainbow-logo-report self-start backdrop-blur-md bg-white bg-opacity-50 rounded-lg`}>
                        <img src={logo} alt="Rainbow Health Finder Logo" />
                    </div>
                    <div className='page-title'>
                        <h1>Survey Reports</h1>
                    </div>
                    <div className='exel-download-home-btn'>
                        <div className='download-exel-btn'>
                            <button
                                title='Download Report'
                                onClick={handleReportDownload}>
                                <Description style={{ color: '#000' }} />
                            </button>
                        </div>
                        <div className="home-page-btn flex flex-row items-end justify-end gap-4">
                            <button
                                title='Logout'
                                className="pointer-events-auto homepage-button text-white rounded-md"
                                style={{
                                    zIndex: '1'
                                }}
                                onClick={handleLogout}
                            >
                                <Logout style={{ color: '#000' }} />
                            </button>
                        </div>
                    </div>
                </nav>
                <div className='filter-btns'>
                    <div className='filter-btn-par'>
                        <p>Overall Sessions</p>
                        <strong>{userData.length}</strong>
                    </div>
                    <div className='filter-btn-par'>
                        <p>Major Gender</p>
                        <strong>{mostGenderAndCount.split('&&')[0]}: {mostGenderAndCount.split('&&')[1]}</strong>
                    </div>
                    <div className='filter-btn-par'>
                        <p>Most Used Avatar</p>
                        <img src={`/src/assets/images/${mostCommonAvatarNameAndAvatar.split('&&')[0]}.webp`} alt="" />
                        <strong>{mostCommonAvatarNameAndAvatar.split('&&')[0]}: {mostCommonAvatarNameAndAvatar.split('&&')[1]}</strong>
                    </div>
                    <div className='filter-btn-par'>
                        <p>Major Service</p>
                        <strong>{mostCommonServiceAndCount.split('&&')[0]}: {mostCommonServiceAndCount.split('&&')[1]}</strong>
                    </div>
                </div>
            </div>
            <div className='filter-grid'>
                <div className='dropdown-container'>

                    <div className='select-input-sec'>
                        {allDropDowns.map((dropdown, dropdownIndex) => (
                            <FormControl className="border-0" key={dropdownIndex} variant="outlined" style={{ width: "15rem", maxWidth: '100%', marginBottom: '1rem' }}>
                                <InputLabel
                                    sx={{ color: '#000' }}
                                    id={`select-label-${dropdownIndex}`}
                                >
                                    {dropdown.filterBy}
                                </InputLabel>
                                <Select
                                    labelId={`select-label-${dropdownIndex}`}
                                    id={`select-${dropdownIndex}`}
                                    multiple
                                    value={selectedValues[dropdown.value] || []}
                                    onChange={(event) => handleFilterChange(event, dropdownIndex)}
                                    label={dropdown.filterBy}
                                    renderValue={(selected) => selected.join(', ')}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200,
                                                top: '572 !important',
                                            },
                                        },
                                    }}
                                >
                                    {dropdown.options.map((option, optionIndex) => (
                                        <MenuItem key={optionIndex} value={option.title}>
                                            <Checkbox checked={(selectedValues[dropdown.value] || []).indexOf(option.title) > -1} />
                                            <ListItemText primary={option.title} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ))}
                        <button onClick={handleViewAllData} className='view-all-btn'>View All Data</button>
                    </div>
                </div>
                <div className='date-container-sec'>
                    <div className='date-filter-all-data'>
                        <div className='date-filter-input'>
                            <DatePicker
                                className='datepicker-custom outline-none'
                                selected={fromDate}
                                onChange={(newValue) => setFromDate(newValue)}
                                selectsStart
                                startDate={fromDate}
                                endDate={toDate}
                                maxDate={new Date()}
                                placeholderText="From Date"
                            />
                            <DatePicker
                                className='datepicker-custom outline-none '
                                selected={toDate}
                                onChange={(newValue) => setToDate(newValue)}
                                selectsEnd
                                startDate={fromDate}
                                endDate={toDate}
                                minDate={fromDate}
                                maxDate={new Date()}
                                placeholderText="To Date"
                            />
                        </div>
                        <div className='date-filter-btn'>
                            <button onClick={handleFilterByDate}>Filter By Date</button>
                        </div>
                    </div>
                    <div className='filter-container'>
                        <div className='flex justify-center flex-col space-y-10'>
                            <h4 className='text-center font-bold'>Filtered infomation</h4>
                            {allSelected && allSelected.length == 0 && (
                                <div className='flex justify-center'>
                                    <p className='opacity-40' >No Filters Yet</p>
                                </div>
                            )}
                        </div>
                        <Box mt={1} style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {allSelected.map((value, index) => (
                                <Chip
                                    key={index}
                                    label={value}
                                    style={{ margin: 2 }}
                                    onDelete={() => {
                                        const updatedSelected = { ...selectedValues };
                                        Object.keys(updatedSelected).forEach((dropdownKey) => {
                                            updatedSelected[dropdownKey] = updatedSelected[dropdownKey].filter((v) => v !== value);
                                        });
                                        setSelectedValues(updatedSelected);
                                    }}
                                />
                            ))}
                        </Box>
                    </div>
                    <div className='filter-count'>
                        <div className="count-sec">
                            <strong>
                                Filter Count
                            </strong>
                            <p>
                                {filteredData.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: 'flex',
                    alignSelf: 'center',
                    flexDirection: 'column',
                    borderRadius: '1rem',
                    width: '100%',
                    margin: '0 auto',
                    overflowX: 'auto'
                }}
                className="react-datatable relative overflow-x-auto"
            >
                <table className="datatable-tail w-full text-sm text-left rtl:text-right table-fixed">
                    <thead className="table-head-tail text-xs text-gray-700 uppercase">
                        <tr>
                            {columnDataTable.map((column, index) => (
                                <th scope="col" className="px-6 w-32 py-3" key={index}>
                                    {column.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, rowIndex) => (
                            <tr className="table-contents-tail bg-white border-b" key={rowIndex}>
                                {columnDataTable.map((column, colIndex) => (
                                    <td className="px-6 w-32 py-4" key={colIndex}>
                                        {item[column.value]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex mb-4 justify-center mt-4">
                <Paginate
                    previousLabel={'Previous'}
                    nextLabel={'Next'}
                    breakLabel={'...'}
                    breakClassName={'break-me'}
                    pageCount={totalPages}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageClick}
                    containerClassName={'pagination'}
                    subContainerClassName={'pages pagination'}
                    activeClassName={'active'}
                />
            </div>
        </div >
    );
};