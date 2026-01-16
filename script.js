// Money Lab - Main JavaScript

document.addEventListener('DOMContentLoaded', function () {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    // Header scroll effect
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Compound Interest Calculator
    const calculateBtn = document.getElementById('calculateBtn');
    let growthChart = null;

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateCompoundInterest);
        // Calculate on load with default values
        calculateCompoundInterest();
    }

    function calculateCompoundInterest() {
        const initialAmount = parseFloat(document.getElementById('initialAmount').value) * 10000;
        const monthlyAmount = parseFloat(document.getElementById('monthlyAmount').value) * 10000;
        const interestRate = parseFloat(document.getElementById('interestRate').value) / 100;
        const contributionPeriod = parseInt(document.getElementById('contributionPeriod').value);
        const holdingPeriod = parseInt(document.getElementById('holdingPeriod').value);
        const compoundFrequency = parseInt(document.getElementById('compoundFrequency').value);

        const totalPeriod = contributionPeriod + holdingPeriod;
        const ratePerPeriod = interestRate / compoundFrequency;
        const monthlyPeriods = 12 / compoundFrequency;

        let yearlyData = [];
        let currentBalance = initialAmount;
        let totalContributions = initialAmount;
        let endOfContributionAmount = 0;

        // Calculate year by year
        for (let year = 0; year <= totalPeriod; year++) {
            if (year === 0) {
                yearlyData.push({
                    year: year,
                    balance: initialAmount,
                    principal: initialAmount,
                    interest: 0
                });
            } else {
                // Calculate for each compound period in this year
                for (let p = 0; p < compoundFrequency; p++) {
                    // Add monthly contributions ONLY DURING contribution period
                    if (year <= contributionPeriod) {
                        currentBalance += monthlyAmount * monthlyPeriods;
                        totalContributions += monthlyAmount * monthlyPeriods;
                    }
                    // Apply interest
                    currentBalance *= (1 + ratePerPeriod);
                }

                if (year === contributionPeriod) {
                    endOfContributionAmount = currentBalance;
                }

                yearlyData.push({
                    year: year,
                    balance: currentBalance,
                    principal: totalContributions,
                    interest: currentBalance - totalContributions
                });
            }
        }

        const finalData = yearlyData[yearlyData.length - 1];
        const growthOnlyAmount = finalData.balance - endOfContributionAmount;

        // Update result display
        document.getElementById('totalPrincipal').textContent = formatCurrency(totalContributions);
        if (document.getElementById('growthOnlyAmount')) {
            document.getElementById('growthOnlyAmount').textContent = '+' + formatCurrency(growthOnlyAmount);
        }
        document.getElementById('finalAmount').textContent = formatCurrency(finalData.balance);
        if (document.getElementById('endOfContributionAmount')) {
            document.getElementById('endOfContributionAmount').textContent = formatCurrency(endOfContributionAmount);
        }

        // Update chart
        updateChart(yearlyData);

        // Add animation
        document.getElementById('results').classList.add('fade-in');
    }

    function formatCurrency(amount) {
        if (amount >= 100000000) {
            return (amount / 100000000).toFixed(2) + '억원';
        } else if (amount >= 10000) {
            return Math.round(amount / 10000).toLocaleString() + '만원';
        } else {
            return Math.round(amount).toLocaleString() + '원';
        }
    }

    function updateChart(data) {
        const ctx = document.getElementById('growthChart');
        if (!ctx) return;

        const labels = data.map(d => d.year + '년차');
        const principalData = data.map(d => Math.round(d.principal / 10000));
        const balanceData = data.map(d => Math.round(d.balance / 10000));

        if (growthChart) {
            growthChart.destroy();
        }

        growthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '총 원금 (만원)',
                        data: principalData,
                        borderColor: '#94a3b8',
                        backgroundColor: 'rgba(148, 163, 184, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: '총 자산 (만원)',
                        data: balanceData,
                        borderColor: '#0052cc',
                        backgroundColor: 'rgba(0, 82, 204, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { family: "'Noto Sans KR', sans-serif", size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: "'Noto Sans KR', sans-serif", size: 14 },
                        bodyFont: { family: "'Noto Sans KR', sans-serif", size: 13 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ' + context.raw.toLocaleString() + '만원';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: "'Noto Sans KR', sans-serif", size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            font: { family: "'Noto Sans KR', sans-serif", size: 11 },
                            callback: function (value) { return value.toLocaleString() + '만'; }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    // Loan Calculator (if on loan page)
    const loanCalculateBtn = document.getElementById('loanCalculateBtn');
    if (loanCalculateBtn) {
        loanCalculateBtn.addEventListener('click', calculateLoan);
        calculateLoan(); // Calculate on load
    }

    function calculateLoan() {
        const loanAmount = parseFloat(document.getElementById('loanAmount').value) * 10000;
        const annualRate = parseFloat(document.getElementById('loanRate').value) / 100;
        const loanTerm = parseInt(document.getElementById('loanTerm').value);
        const repaymentType = document.getElementById('repaymentType').value;

        const monthlyRate = annualRate / 12;
        const totalMonths = loanTerm * 12;

        let totalPayment = 0;
        let totalInterest = 0;
        let monthlyPayment = 0;

        // Data for chart
        let chartData = [];
        let currentBalance = loanAmount;
        let accumulatedInterest = 0;
        let accumulatedPrincipal = 0;

        // Add initial state (Month 0)
        chartData.push({
            month: 0,
            balance: loanAmount,
            accumulatedInterest: 0,
            accumulatedPrincipal: 0
        });

        if (repaymentType === 'equal-payment') {
            // 원리금균등상환
            if (monthlyRate === 0) {
                monthlyPayment = loanAmount / totalMonths;
            } else {
                monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
            }
            totalPayment = monthlyPayment * totalMonths;
            totalInterest = totalPayment - loanAmount;

            // Generate monthly data
            let tempBalance = loanAmount;
            for (let i = 1; i <= totalMonths; i++) {
                const interest = tempBalance * monthlyRate;
                const principal = monthlyPayment - interest;
                tempBalance -= principal;
                if (tempBalance < 0) tempBalance = 0; // Fix floating point errors

                accumulatedInterest += interest;
                accumulatedPrincipal += principal;

                // Push data for chart (every year or last month)
                if (i % 12 === 0 || i === totalMonths) {
                    chartData.push({
                        month: i,
                        balance: Math.round(tempBalance),
                        accumulatedInterest: Math.round(accumulatedInterest),
                        accumulatedPrincipal: Math.round(accumulatedPrincipal)
                    });
                }
            }
        } else {
            // 원금균등상환
            const principalPayment = loanAmount / totalMonths;
            let tempBalance = loanAmount;

            for (let i = 1; i <= totalMonths; i++) {
                const interest = tempBalance * monthlyRate;
                const payment = principalPayment + interest;

                tempBalance -= principalPayment;
                if (tempBalance < 0) tempBalance = 0;

                totalPayment += payment;
                totalInterest += interest;

                accumulatedInterest += interest;
                accumulatedPrincipal += principalPayment;

                // Push data for chart
                if (i % 12 === 0 || i === totalMonths) {
                    chartData.push({
                        month: i,
                        balance: Math.round(tempBalance),
                        accumulatedInterest: Math.round(accumulatedInterest),
                        accumulatedPrincipal: Math.round(accumulatedPrincipal)
                    });
                }
            }
            monthlyPayment = loanAmount / totalMonths + loanAmount * monthlyRate; // First month payment for display
        }

        // Update display
        document.getElementById('loanMonthlyPayment').textContent = formatCurrency(monthlyPayment) + (repaymentType === 'equal-principal' ? ' (첫달)' : '');
        document.getElementById('loanTotalInterest').textContent = formatCurrency(totalInterest);
        document.getElementById('loanTotalPayment').textContent = formatCurrency(totalPayment);

        // Update loan chart
        updateLoanChart(chartData);

        // Add animation
        document.getElementById('results').classList.add('fade-in');
    }

    let loanChart = null;
    function updateLoanChart(data) {
        const ctx = document.getElementById('loanChart');
        if (!ctx) return;

        if (loanChart) {
            loanChart.destroy();
        }

        const labels = data.map((d, index) => index === 0 ? '시작' : (d.month / 12) + '년');
        const balanceData = data.map(d => Math.round(d.balance / 10000));
        const interestData = data.map(d => Math.round(d.accumulatedInterest / 10000));
        const principalData = data.map(d => Math.round(d.accumulatedPrincipal / 10000));

        loanChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '대출 잔액 (만원)',
                        data: balanceData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 3
                    },
                    {
                        label: '누적 상환 원금 (만원)',
                        data: principalData,
                        borderColor: '#059669',
                        backgroundColor: 'transparent',
                        borderDash: [5, 5],
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0
                    },
                    {
                        label: '누적 이자 (만원)',
                        data: interestData,
                        borderColor: '#f59e0b',
                        backgroundColor: 'transparent',
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            font: { family: "'Noto Sans KR', sans-serif", size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: "'Noto Sans KR', sans-serif", size: 14 },
                        bodyFont: { family: "'Noto Sans KR', sans-serif", size: 13 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ' + context.raw.toLocaleString() + '만원';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { maxTicksLimit: 10 }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            callback: function (value) { return value.toLocaleString() + '만'; }
                        }
                    }
                }
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // Input validation - numbers only
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function () {
            if (this.value < 0) this.value = 0;
        });
    });
});
