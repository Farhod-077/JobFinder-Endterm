"use strict";

jQuery(function ($) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reducedMotion ? 0 : 180;

    $(".faq-question").on("click", function () {
        const button = $(this);
        const item = button.closest(".faq-item");
        const answer = item.find(".faq-answer");
        const expanded = button.attr("aria-expanded") === "true";

        item.siblings(".faq-item")
            .find(".faq-question")
            .attr("aria-expanded", "false");

        item.siblings(".faq-item")
            .find(".faq-answer")
            .stop(true, true)
            .slideUp(duration);

        button.attr("aria-expanded", String(!expanded));
        answer.stop(true, true).slideToggle(duration);
    });

    $("#faq-search").on("input", function () {
        const query = $(this).val().trim().toLowerCase();
        let visibleCount = 0;

        $("#faq-list").children(".faq-item").each(function () {
            const item = $(this);
            const matches = item.text().toLowerCase().includes(query);

            item.toggle(matches);

            if (matches) {
                visibleCount += 1;
            } else {
                item.find(".faq-question").attr("aria-expanded", "false");
                item.find(".faq-answer").stop(true, true).hide();
            }
        });

        if (visibleCount === 0) {
            $("#faq-empty").stop(true, true).fadeIn(duration);
        } else {
            $("#faq-empty").stop(true, true).fadeOut(duration);
        }
    });
});