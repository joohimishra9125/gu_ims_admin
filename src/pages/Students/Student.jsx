import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useHttp2 from '../../hooks/useHttp2'
import PageHeader from '../../components/UI/PageHeader'
import MyTable from '../../components/table/MyTable'
import MyPagination from '../../components/table/MyPagination'
import { studentColumn } from '../../utils/Columns'
import SearchBar from '../../components/filter/SearchBar'
import { FaDownload, FaPlus } from 'react-icons/fa'
import { Button, Space, message } from 'antd'
import Cookies from 'js-cookie'
import SearchAndFilter from '../../components/filter/SearchAndFilter'
import SelectsFilter from '../../components/filter/SelectsFilter'
import UpdateMark from '../../components/modals/UpdateMark'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const Students = () => {
   const { sendRequest, isLoading } = useHttp2()
   const [data, setData] = useState([])
   const [pageDetails, setPageDetails] = useState({})
   const [limit, setLimit] = useState(10)
   const [page, setPage] = useState(1)
   const navigation = useNavigate()
   const [student, setStudent] = useState({})
   const [modal, setModal] = useState(false)
   const [query, setQuery] = useState('')
   const [downloading, setDownloading] = useState(false)
   const [downloadType, setDownloadType] = useState(null)
   const [queryObject, setQueryObject] = useState({
    semester: '',
    courseName: '',
    collegeName:'',    programName: '',
    marksUpdated: '',
    valueName: 'Theory'
  })

   const paginationObject = {
     pageDetails,
     limit,
     setLimit,
     page,
     setPage
   }

   const constructUrl = (limit, page, query, queryObject) => {
     const params = new URLSearchParams({ limit, page, search: query });
     if (queryObject.collegeName) {
       params.append('collegeName', queryObject.collegeName);
     }
     if (queryObject.courseName) {
       params.append('courseName', queryObject.courseName);
     }
     if (queryObject.programName) {
       params.append('programName', queryObject.programName);
     }
     if (queryObject.semester) {
       params.append('semester', Number(queryObject.semester));
     }
     if (queryObject.marksUpdated) {
       params.append('marksUpdated', queryObject.marksUpdated);
     }
     if (queryObject.valueName) {
       params.append('valueName', queryObject.valueName)
    }
    return `student?${params.toString()}`;
   };

   const navigate = useNavigate()

   const getData = () => {
     sendRequest({
       url: constructUrl(limit, page, query, queryObject)
     }, result => {
       setData(result.data.docs)
       setPageDetails({ ...result.data, docs: [] })
     })
   }
   const getAllFilteredData = (callback) => {
    const allDataUrl = constructUrl(pageDetails.totalDocs || 1000, 1, query, queryObject);
    
    sendRequest({
      url: allDataUrl
    }, result => {
      callback(result.data.docs.map(item => ({
        ...item,
        marksStatus: item.marksUpdated === 'updated' ? 'Updated' 
          : item.marksUpdated === 'modified' ? 'Modified'
          : 'Pending'
      })));
    })
  }
   useEffect(() => {
     getData()
   }, [limit, page, query, queryObject])

   useEffect(() => {
    setPage(1)
  }, [query,queryObject])

   function handleModal(){
     setStudent(this)
     setModal(true)
   }

   const columns = studentColumn(handleModal)

   
  const handleClear = () => {
    setQueryObject({
      semester: '',
      courseName: '',
      programName: '',
      marksUpdated: '',
      valueName: 'Theory',
      collegeName:''
    })
  }

  // const handleDownloadPDF = () => {
  //   setDownloading(true);
  //   setDownloadType('pdf');
  //   getAllFilteredData((allData) => {
  //     const doc = new jsPDF('landscape');
  //     doc.setFontSize(18);
  //     doc.text('Students List', 14, 22);
  //     const tableData = allData.map(item => [
  //       item.examRollNumber,
  //       item.programName,
  //       item.courseName,
  //       item.internalTheoryMarks,
  //       item.externalPracticalMarks,
  //       item.internalPracticalMarks,
  //       item.marksStatus
  //     ]);
  //     doc.autoTable({
  //       startY: 30,
  //       head: [['Exam Roll', 'Program', 'Course', 'Int Theory Marks', 'Ext Practical Marks','Int Practical Marks', 'Status']],
  //       body: tableData,
  //       theme: 'striped',
  //       styles: { 
  //         fontSize: 8,
  //         cellPadding: 2 
  //       },
  //       columnStyles: { 
  //         0: { cellWidth: 30 },
  //         1: { cellWidth: 40 },
  //         2: { cellWidth: 40 },
  //         3: { cellWidth: 30 },
  //         4: { cellWidth: 30 },
  //         5: { cellWidth: 30 },
  //         6: { cellWidth: 30 }
  //       }
  //     });
 
  //     doc.save(`Students_${new Date().toISOString().split('T')[0]}.pdf`);
      
  //     setDownloading(false);
  //     setDownloadType(null);
  //   });
  // }
  const handleDownloadPDF = () => {
    setDownloading(true);
    getAllFilteredData((allData) => {
      const doc = new jsPDF('landscape');
      doc.setFontSize(18);
      doc.text('Students List', 14, 22);

      // Conditional column setup based on valueName
      if (queryObject.valueName === 'Theory') {
        const tableData = allData.map(item => [
          item.examRollNumber,
          item.programName,
          item.courseName,
          item.internalTheoryMarks,
          item.externalPracticalMarks,
          item.internalPracticalMarks,
          item.valueName,
          item.marksStatus
        ]);

        doc.autoTable({
          startY: 30,
          head: [['Exam Roll', 'Program', 'Course', 'Int Theory Marks','Ext Practical Marks', 'Int Practical Marks','Subject Type' ,'Status']],
          body: tableData,
          theme: 'striped',
          styles: { 
            fontSize: 8,
            cellPadding: 2 
          },
          columnStyles: { 
            0: { cellWidth: 20 },
            1: { cellWidth: 40 },
            2: { cellWidth: 40 },
            3: { cellWidth: 20 },
            4: { cellWidth: 20 },
            5: { cellWidth: 20 },
            6: { cellWidth: 20 }
          }
        });
      } else {
        const tableData = allData.map(item => [
          item.examRollNumber,
          item.programName,
          item.courseName,
          item.internalTheoryMarks,
          item.internalPracticalMarks,
          item.externalPracticalMarks,
          item.valueName,
          item.examinerName || 'N/A',
          item.contact || 'N/A',
          item.organization || 'N/A',
          item.internalExaminerName || 'N/A',
          item.marksStatus
        ]);

        doc.autoTable({
          startY: 30,
          head: [
            ['Exam Roll', 'Program', 'Course','Int Theory Marks' ,'Int Practical Marks', 'Ext Practical Marks','Subject Type',
            'External Examiner', 'Contact', 'Organization', 'Internal Examiner', 'Status']
          ],
          body: tableData,
          theme: 'striped',
          styles: { 
            fontSize: 8,
            cellPadding: 2 
          },
          columnStyles: { 
            0: { cellWidth: 15 },
            1: { cellWidth: 30 },
            2: { cellWidth: 30 },
            3: { cellWidth: 10 },
            4: { cellWidth: 10 },
            5: { cellWidth: 10 },
            6: { cellWidth: 20 },
            7: { cellWidth: 20 },
            8: { cellWidth: 35 },
            9: { cellWidth: 35 },
            10: { cellWidth: 25 }
          }
        });
      }
 
      doc.save(`Students_${queryObject.valueName}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setDownloading(false);
    });
  }

   const handleDownloadExcel = () => {
     setDownloading(true);
     getAllFilteredData((allData) => {
       const excelData = allData.map(item => ({
         'Exam Roll Number': item.examRollNumber,
         'Civil ID': item.civilId,
         'Semester': item.semester,
         'Program Name': item.programName,
         'Course Name': item.courseName,
         'Course ID': item.courseId,
         'Reference': item.reference,
         'Course Code': item.courseCode,
         'External Practical Marks': item.externalPracticalMarks,
         'External Practical Total Marks': item.externalPracticalTotalMarks,
         'Internal Practical Marks': item.internalPracticalTMarks,
         'Internal Practical Total Marks': item.internalPracticalTotalMarks,
         'Internal Theory Marks': item.internalTheoryMarks,
         'Internal Theory Total Marks': item.internalTheoryTotalMarks,
         'Value Name': item.valueName,
         'Overall Total Marks': item.overallTotalMarks,
         'Marks Updated Status':  item.marksStatus,
         'Examiner Name': item.examinerName || '--',
        'Examiner Contact': item.contact || '--',
        'Examiner organization': item.organization || '--',
        'Internal ExaminerName': item.internalExaminerName || '--',
       }));
       const worksheet = XLSX.utils.json_to_sheet(excelData);
       const workbook = XLSX.utils.book_new();
       XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
       XLSX.writeFile(workbook, `Students_${new Date().toISOString().split('T')[0]}.xlsx`);
       setDownloading(false);
     });
   }

   return (
     <>
       <div
         style={{
           display: 'flex',
           flexDirection: 'column',
           rowGap: 25
         }}
       >
         <PageHeader heading={'Students List'}>
           <Space>
             <Button onClick={handleClear} style={{height:35,width:100}} type='default'>
               Clear Filter
             </Button>
             <Button 
               onClick={handleDownloadExcel} 
               style={{height:35}} 
               type='primary' 
               icon={<FaDownload />}
               loading={downloading}
             >
               Export Excel
             </Button>
             <Button 
               onClick={handleDownloadPDF} 
               style={{height:35}} 
               type='primary' 
               icon={<FaDownload />}
               loading={downloading && downloadType === 'pdf'}
             >
               Export PDF
             </Button>
           </Space>
         </PageHeader>
         <SelectsFilter 
           handleClear={() => handleClear()} 
           setQueryObject={setQueryObject} 
           queryObject={queryObject} 
         />
         <SearchBar 
           func={setQuery} 
           value={query} 
           placeholder={'Search by exam roll no., course code, course id'} 
         />
         <h4 style={{ color: 'var(--color_black_2)', fontWeight: '500' }}>
           {pageDetails?.totalDocs ?? 0} Results
         </h4>
         <MyTable data={data} columns={columns} />
         <MyPagination {...paginationObject} />
       </div>
       {/* <UpdateMark 
         modalFunc={setModal} 
         modalValue={modal} 
         refreshFunc={getData} 
         student={student}
       /> */}
     </>
   )
}

export default Students