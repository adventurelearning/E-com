import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaTrash, FaSearch, FaFilter, FaComment, FaEdit } from 'react-icons/fa';
import { format } from 'date-fns';
import Api from '../../Services/Api';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [adminComment, setAdminComment] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const reviewsPerPage = 10;

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await Api.get('reviews/admin');
                setReviews(response.data);
                setFilteredReviews(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch reviews');
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    useEffect(() => {
        let result = [...reviews];

        // Apply search filter
        if (searchTerm) {
            result = result.filter(review =>
                review.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.comment.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply rating filter
        if (filterRating !== 'all') {
            result = result.filter(review => review.rating === parseInt(filterRating));
        }

        // Apply sorting
        if (sortOrder === 'newest') {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortOrder === 'oldest') {
            result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else if (sortOrder === 'highest') {
            result.sort((a, b) => b.rating - a.rating);
        } else if (sortOrder === 'lowest') {
            result.sort((a, b) => a.rating - b.rating);
        }

        setFilteredReviews(result);
        setCurrentPage(1);
    }, [searchTerm, filterRating, sortOrder, reviews]);

    // Pagination
    const indexOfLastReview = currentPage * reviewsPerPage;
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
    const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await Api.delete(`reviews/${reviewId}`);

                setReviews(reviews.filter(review => review._id !== reviewId));
            } catch (err) {
                console.error('Failed to delete review');
            }
        }
    };

    const handleSaveAdminComment = async (reviewId) => {
        try {
            console.log(`Saving admin comment for review ID: ${reviewId},adminComment: ${adminComment}`);

            await Api.put(`reviews/admin-comment/${reviewId}`, { adminComment });

            // Update local state
            setReviews(reviews.map(review =>
                review._id === reviewId ? { ...review, adminComment } : review
            ));

            setEditingCommentId(null);
            setAdminComment('');
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save admin comment');
        }
    };

    const openCommentModal = (review) => {
        setSelectedReview(review);
        setAdminComment(review.adminComment || '');
        setIsModalOpen(true);
    };

    const renderStars = (rating, size = 'base') => {
        const sizeClasses = {
            sm: 'text-xs',
            base: 'text-base',
            lg: 'text-lg'
        };

        return [...Array(5)].map((_, i) => (
            <FaStar
                key={i}
                className={`${i < rating ? 'text-yellow-400' : 'text-gray-300'} ${sizeClasses[size]}`}
            />
        ));
    };

    const renderDetailedRatings = (ratings) => {
        if (!ratings) return null;

        return (
            <div className="grid grid-cols-1 gap-1 text-xs">
                {Object.entries(ratings).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 items-center">
                        <span className="font-medium capitalize mr-1">{key}:</span>
                        <div className="flex">
                            {renderStars(value, 'sm')}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Comment Modal */}
            {isModalOpen && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-purple-700 mb-4">
                            Admin Comment for Review
                        </h3>
                        <textarea
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                            className="w-full h-32 p-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter your comment..."
                        />
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSaveAdminComment(selectedReview._id)}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Save Comment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Customer Reviews</h1>

                    <div className="flex flex-wrap gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search reviews..."
                                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <div className="flex items-center bg-white border rounded-lg px-3">
                                <FaFilter className="text-gray-400 mr-2" />
                                <select
                                    value={filterRating}
                                    onChange={(e) => setFilterRating(e.target.value)}
                                    className="py-2 bg-transparent focus:outline-none"
                                >
                                    <option value="all">All Ratings</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                            </div>

                            <div className="flex items-center bg-white border rounded-lg px-3">
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="py-2 bg-transparent focus:outline-none"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="highest">Highest Rated</option>
                                    <option value="lowest">Lowest Rated</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl font-bold mb-2">{reviews.length}</div>
                        <div className="text-sm opacity-80">Total Reviews</div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl font-bold mb-2">
                            {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length || 0).toFixed(2)}
                        </div>
                        <div className="text-sm opacity-80">Average Rating</div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl font-bold mb-2">
                            {reviews.filter(r => r.rating === 5).length}
                        </div>
                        <div className="text-sm opacity-80">5-Star Reviews</div>
                    </div>

                    <div className="bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl p-6 shadow-lg">
                        <div className="text-3xl font-bold mb-2">
                            {reviews.filter(r => r.rating === 1).length}
                        </div>
                        <div className="text-sm opacity-80">1-Star Reviews</div>
                    </div>
                </div>

                {filteredReviews.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-100 border-2 border-dashed rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <FaSearch className="text-gray-400 text-2xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">No reviews found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg border border-purple-100">
                            <table className="min-w-full divide-y divide-purple-100">
                                <thead className="bg-purple-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                                            Reviewer
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                                            Detailed Ratings
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                                            Review
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                                            Admin Comment
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-purple-700 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-purple-50">
                                    {currentReviews.map((review) => (
                                        <tr key={review._id} className="hover:bg-purple-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {review.product?.name || 'Product Deleted'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 flex items-center justify-center mr-3">
                                                        <span className="font-bold text-gray-500 text-sm">
                                                            {review.user?.name?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-900">
                                                        {review.user?.name || 'Anonymous'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {renderStars(review.rating)}
                                                    <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {renderDetailedRatings(review.detailedRatings)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-md line-clamp-2">
                                                    {review.comment}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs">
                                                {editingCommentId === review._id ? (
                                                    <div className="flex flex-col">
                                                        <textarea
                                                            value={adminComment}
                                                            onChange={(e) => setAdminComment(e.target.value)}
                                                            className="w-full p-2 border border-purple-300 rounded mb-2 text-sm"
                                                            rows="3"
                                                        />
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleSaveAdminComment(review._id)}
                                                                className="text-xs bg-purple-600 text-white px-2 py-1 rounded"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingCommentId(null)}
                                                                className="text-xs bg-gray-200 px-2 py-1 rounded"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={`text-sm ${review.adminComment ? 'text-gray-700' : 'text-gray-400 italic'} cursor-pointer`}
                                                        onClick={() => {
                                                            setAdminComment(review.adminComment || '');
                                                            setEditingCommentId(review._id);
                                                        }}
                                                    >
                                                        {review.adminComment || 'Click to add comment...'}
                                                        {review.adminComment && (
                                                            <span className="text-purple-600 text-xs ml-2">(Edit)</span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3 items-center justify-center">
                                                <button
                                                    onClick={() => openCommentModal(review)}
                                                    className="text-purple-600 hover:text-purple-800 flex items-center"
                                                    title="Add admin comment"
                                                >
                                                    <FaComment className="mr-1" />
                                                </button>
                                                {/* <button
                                                    onClick={() => handleDeleteReview(review._id)}
                                                    className="text-red-600 hover:text-red-800 flex items-center"
                                                    title="Delete review"
                                                >
                                                    <FaTrash className="mr-1" />
                                                </button> */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{indexOfFirstReview + 1}</span> to{' '}
                                <span className="font-medium">
                                    {Math.min(indexOfLastReview, filteredReviews.length)}
                                </span> of{' '}
                                <span className="font-medium">{filteredReviews.length}</span> reviews
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage > totalPages - 3) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 rounded-md ${currentPage === pageNum ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ReviewManagement;