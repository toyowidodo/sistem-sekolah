import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';

export default function DataTable({ 
    columns, 
    data,
    serverSide = false,
    totalData = 0,
    page = 1,
    onPageChange,
    perPage = 10,
    onPerPageChange
}) {
    const [internalPage, setInternalPage] = useState(1);
    const [internalPerPage, setInternalPerPage] = useState(10);

    const currentPage = serverSide ? page : internalPage;
    const itemsPerPage = serverSide ? perPage : internalPerPage;
    const currentTotal = serverSide ? totalData : (data?.length || 0);

    // Reset page if data length changes drastically (only for client-side)
    useEffect(() => {
        if (!serverSide) setInternalPage(1);
    }, [data?.length, internalPerPage, serverSide]);

    if (!data || data.length === 0) {
        return (
            <div
                className="rounded-2xl flex flex-col items-center justify-center py-16"
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                }}
            >
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'var(--bg-empty-icon)', border: '1px solid var(--border-empty-icon)' }}
                >
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="rgba(99,102,241,0.7)" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                </div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Tidak ada data
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Belum ada data yang tersedia
                </p>
            </div>
        );
    }

    const totalPages = Math.ceil(currentTotal / itemsPerPage);
    const paginatedData = serverSide ? data : data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const setCurrentPage = (newPage) => {
        if (serverSide && onPageChange) {
            onPageChange(newPage);
        } else {
            setInternalPage(newPage);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        const renderPageBtn = (pageNum) => (
            <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`relative w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors duration-200 z-10 ${
                    currentPage === pageNum ? 'text-white' : 'hover:bg-indigo-500/10'
                }`}
                style={{
                    color: currentPage === pageNum ? '#fff' : 'var(--text-secondary)'
                }}
            >
                {currentPage === pageNum && (
                    <motion.div
                        layoutId="activePagePill"
                        className="absolute inset-0 rounded-lg shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', zIndex: -1 }}
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                )}
                <span className="relative z-10">{pageNum}</span>
            </button>
        );

        if (startPage > 1) {
            pages.push(renderPageBtn(1));
            if (startPage > 2) pages.push(<span key="dots-1" className="px-1 text-[var(--text-muted)] flex items-center justify-center w-8">...</span>);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(renderPageBtn(i));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) pages.push(<span key="dots-2" className="px-1 text-[var(--text-muted)] flex items-center justify-center w-8">...</span>);
            pages.push(renderPageBtn(totalPages));
        }

        return pages;
    };

    return (
        <div
            className="rounded-2xl overflow-hidden flex flex-col relative"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                boxShadow: 'var(--shadow-card)',
            }}
        >
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className={`py-3.5 px-4 text-xs font-semibold uppercase tracking-wider ${col.noPrint ? 'no-print' : ''}`}
                                    style={{ color: 'var(--text-th)', background: 'var(--bg-table-head)' }}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <motion.tbody
                        key={`tbody-${currentPage}-${itemsPerPage}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {paginatedData.map((row, i) => (
                            <tr
                                key={i}
                                style={{
                                    borderBottom: '1px solid var(--border)',
                                    background: i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-table-hover)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = i % 2 !== 0 ? 'var(--bg-table-even)' : 'transparent'; }}
                            >
                                {columns.map((col, j) => (
                                    <td
                                        key={j}
                                        className={`py-3 px-4 text-sm ${col.noPrint ? 'no-print' : ''}`}
                                        style={{ color: 'var(--text-td)' }}
                                    >
                                        {col.render ? col.render(row) : row[col.field]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </motion.tbody>
                </table>
            </div>

            {/* Premium Pagination Footer */}
            <div
                className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print relative"
                style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-table-head)' }}
            >
                {/* Left side: Items per page & Counter */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:border-indigo-500/50" 
                         style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                        <Layers size={14} className="text-indigo-400" />
                        <select 
                            value={itemsPerPage} 
                            onChange={(e) => {
                                const newPerPage = Number(e.target.value);
                                if (serverSide && onPerPageChange) {
                                    onPerPageChange(newPerPage);
                                } else {
                                    setInternalPerPage(newPerPage);
                                }
                            }}
                            className="bg-transparent border-none outline-none font-medium cursor-pointer"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            <option value={5}>5 Baris</option>
                            <option value={10}>10 Baris</option>
                            <option value={20}>20 Baris</option>
                            <option value={50}>50 Baris</option>
                        </select>
                    </div>
                    
                    <div className="font-medium" style={{ color: 'var(--text-muted)' }}>
                        Menampilkan <span style={{ color: 'var(--text-primary)' }}>{(currentPage - 1) * itemsPerPage + 1}</span> - <span style={{ color: 'var(--text-primary)' }}>{Math.min(currentPage * itemsPerPage, currentTotal)}</span> dari <span style={{ color: 'var(--text-primary)' }}>{currentTotal}</span>
                    </div>
                </div>
                
                {/* Right side: Dynamic Island Pagination */}
                <div className="flex items-center p-1.5 rounded-xl shadow-sm" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
                    
                    <button 
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className={`p-1.5 rounded-lg transition-all ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-indigo-500/10 hover:text-indigo-500'}`}
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* Interactive Page Numbers with Animated Pill */}
                    <div className="flex items-center px-2 gap-1">
                        {renderPageNumbers()}
                    </div>

                    <button 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`p-1.5 rounded-lg transition-all ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-indigo-500/10 hover:text-indigo-500'}`}
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        <ChevronRight size={16} />
                    </button>

                </div>
            </div>

            {/* Scrub-able Progress Bar (Invisible until hovered over bottom edge) */}
            {totalPages > 1 && (
                <div 
                    className="absolute bottom-0 left-0 right-0 h-1 cursor-pointer group"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - rect.left) / rect.width;
                        const target = Math.max(1, Math.min(totalPages, Math.ceil(percent * totalPages)));
                        setCurrentPage(target);
                    }}
                >
                    {/* Hitbox expander for easier clicking */}
                    <div className="absolute inset-x-0 bottom-0 h-4 bg-transparent" />
                    <div className="absolute inset-0 bg-transparent group-hover:bg-indigo-500/10 transition-colors" />
                    <motion.div 
                        className="h-full bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                        initial={false}
                        animate={{ width: `${(currentPage / totalPages) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                </div>
            )}
        </div>
    );
}
